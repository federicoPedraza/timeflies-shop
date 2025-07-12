import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import crypto from 'crypto';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Función para obtener el body raw como Buffer
async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error('No request body available');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}

// Función para verificar la firma HMAC del webhook usando crypto.timingSafeEqual
function verifyWebhookSignature(rawBody: Buffer, hmacHeader: string): boolean {
  const appSecret = process.env.TIENDANUBE_APP_SECRET;
  if (!appSecret) {
    console.error('❌ TIENDANUBE_APP_SECRET no está configurado');
    return false;
  }

  const expectedHmac = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  // Usar timingSafeEqual para prevenir timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hmacHeader, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );
}

// Función para generar un ID único para idempotencia
function generateIdempotencyKey(storeId: number, event: string, id: number): string {
  // Para product/updated y order/updated, incluimos timestamp para permitir múltiples actualizaciones
  if (event === 'product/updated' || event === 'order/updated') {
    return `${storeId}-${event}-${id}-${Date.now()}`;
  }
  return `${storeId}-${event}-${id}`;
}

// Función para manejar webhooks requeridos por LGPD
async function handleRequiredWebhooks(payload: any) {
  const { event, store_id } = payload;

  switch (event) {
    case 'store/redact':
      console.log('🔴 Webhook LGPD: store/redact recibido');
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));
      console.log('⚠️  Acción requerida: Eliminar datos de la tienda', store_id);

      try {
        // Eliminar todos los productos (LGPD)
        await convex.mutation(api.products.deleteAllProducts, {});
        console.log('✅ Datos de la tienda eliminados correctamente');
      } catch (error) {
        console.error('❌ Error eliminando datos de la tienda:', error);
      }
      break;

    case 'customers/redact':
      console.log('🔴 Webhook LGPD: customers/redact recibido');
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));
      console.log('⚠️  Acción requerida: Eliminar datos del cliente');
      // TODO: Implementar eliminación de datos del cliente
      break;

    case 'customers/data_request':
      console.log('🔴 Webhook LGPD: customers/data_request recibido');
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));
      console.log('⚠️  Acción requerida: Enviar datos del cliente al comerciante');
      // TODO: Implementar envío de datos del cliente
      break;

    default:
      return false; // No es un webhook requerido
  }

  return true; // Es un webhook requerido
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  console.log(`\n🚀 [${requestId}] Webhook recibido - ${new Date().toISOString()}`);
  console.log(`📡 Headers:`, Object.fromEntries(request.headers.entries()));

    try {
    // Obtener el body raw como Buffer para verificación HMAC
    const rawBody = await getRawBody(request);
    const hmacHeader = request.headers.get('x-linkedstore-hmac-sha256') ||
                      request.headers.get('HTTP_X_LINKEDSTORE_HMAC_SHA256');

    console.log(`🔐 HMAC Header: ${hmacHeader}`);
    console.log(`📦 Body recibido: ${rawBody.toString()}`);

    // Verificar la firma del webhook
    if (hmacHeader) {
      const isValid = verifyWebhookSignature(rawBody, hmacHeader);
      if (!isValid) {
        console.error('❌ Verificación HMAC fallida');
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
      console.log('✅ Verificación HMAC exitosa');
    } else {
      console.warn('⚠️  No se encontró header HMAC - verificación omitida');
    }

    // Parsear el payload
    let payload;
    try {
      payload = JSON.parse(rawBody.toString());
    } catch (error) {
      console.error('❌ Error parseando JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log(`📋 Payload parseado:`, JSON.stringify(payload, null, 2));

    const { store_id, event, id } = payload;

    // Verificar campos requeridos
    if (!store_id || !event) {
      console.error('❌ Campos requeridos faltantes: store_id o event');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Manejar webhooks requeridos por LGPD
    const isRequiredWebhook = await handleRequiredWebhooks(payload);
    if (isRequiredWebhook) {
      const processingTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] Webhook LGPD procesado en ${processingTime}ms`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Generar clave de idempotencia
    const idempotencyKey = generateIdempotencyKey(Number(store_id), event, id);
    console.log(`🔄 Clave de idempotencia: ${idempotencyKey}`);

    // Verificar si ya procesamos este webhook (idempotencia)
    // Para product/updated, siempre procesamos aunque sea duplicado
    let isDuplicate = false;
    try {
      const existingWebhook = await convex.query(api.products.getWebhookLog, {
        idempotencyKey
      });

      if (existingWebhook) {
        console.log(`🔄 Webhook ya procesado anteriormente: ${idempotencyKey}`);
        isDuplicate = true;

        // Para product/updated y order/updated, procesamos aunque sea duplicado
        if (event === 'product/updated' || event === 'order/updated') {
          console.log(`📝 [${requestId}] ${event === 'product/updated' ? 'Producto' : 'Orden'} actualizado - procesando aunque sea duplicado`);
        } else {
          const processingTime = Date.now() - startTime;
          console.log(`✅ [${requestId}] Webhook duplicado ignorado en ${processingTime}ms`);
          return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
        }
      }
    } catch (error) {
      console.warn('⚠️  Error verificando idempotencia:', error);
    }

    // Procesar eventos de productos
    if (event.startsWith('product/')) {
      console.log(`🛍️  Procesando evento de producto: ${event}`);

      try {
        // Registrar el webhook para idempotencia
        await convex.mutation(api.products.logWebhook, {
          idempotencyKey,
          storeId: Number(store_id),
          event,
          productId: id,
          payload: JSON.stringify(payload),
          processedAt: new Date().toISOString(),
          status: 'processed'
        });

        // Procesar según el tipo de evento
        switch (event) {
          case 'product/created':
          case 'product/updated':
            // Para product/updated, siempre obtenemos los datos completos del producto desde TiendaNube
            console.log(`📝 Procesando ${event} - obteniendo datos completos del producto ${id}${isDuplicate ? ' (duplicado)' : ''}`);

            try {
              // Llamar al endpoint dedicado para actualizar productos
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
              const updateResponse = await fetch(`${baseUrl}/api/webhooks/tiendanube/update-product`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  productId: id,
                  storeId: Number(store_id),
                }),
              });

              if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log(`✅ [Webhook Handler] Producto actualizado con datos completos: ${id}`, result);
              } else {
                console.error(`❌ [Webhook Handler] Error actualizando producto ${id}:`, await updateResponse.text());
              }
            } catch (error) {
              console.error(`❌ Error obteniendo datos del producto ${id}:`, error);
            }
            break;

          case 'product/deleted':
            // Buscar el producto en tiendanube_products y eliminarlo
            const existingProduct = await convex.query(api.products.getProductByTiendanubeId, {
              tiendanubeId: id
            });

            if (existingProduct) {
              await convex.mutation(api.products.deleteTiendanubeProduct, {
                productId: existingProduct._id
              });
              console.log(`🗑️  Producto eliminado: ${id}`);
            } else {
              console.log(`ℹ️  Producto ${id} no encontrado en la base de datos`);
            }
            break;

          default:
            console.warn(`⚠️  Evento de producto no manejado: ${event}`);
        }

      } catch (error) {
        console.error('❌ Error procesando evento de producto:', error);
        return NextResponse.json(
          { error: 'Error processing product event' },
          { status: 500 }
        );
      }
    } else if (event.startsWith('order/')) {
      console.log(`📦 Procesando evento de orden: ${event}`);

      try {
        // Registrar el webhook para idempotencia
        await convex.mutation(api.products.logWebhook, {
          idempotencyKey,
          storeId: Number(store_id),
          event,
          productId: id || null,
          payload: JSON.stringify(payload),
          processedAt: new Date().toISOString(),
          status: 'processed'
        });

        // Procesar según el tipo de evento
        switch (event) {
          case 'order/created':
          case 'order/updated':
            console.log(`📝 Procesando ${event} - obteniendo datos completos de la orden ${id}${isDuplicate ? ' (duplicado)' : ''}`);

            try {
              // Llamar al endpoint dedicado para actualizar órdenes
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
              const updateResponse = await fetch(`${baseUrl}/api/webhooks/tiendanube/update-order`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: id,
                  storeId: Number(store_id),
                }),
              });

              if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log(`✅ [Webhook Handler] Orden procesada con datos completos: ${id}`, result);
              } else {
                console.error(`❌ [Webhook Handler] Error procesando orden ${id}:`, await updateResponse.text());
              }
            } catch (error) {
              console.error(`❌ Error obteniendo datos de la orden ${id}:`, error);
            }
            break;

          default:
            console.warn(`⚠️  Evento de orden no manejado: ${event}`);
        }

      } catch (error) {
        console.error('❌ Error procesando evento de orden:', error);
        return NextResponse.json(
          { error: 'Error processing order event' },
          { status: 500 }
        );
      }
    } else {
      console.log(`ℹ️  Evento no manejado: ${event}`);
      // Registrar webhook no manejado para auditoría
      await convex.mutation(api.products.logWebhook, {
        idempotencyKey,
        storeId: Number(store_id),
        event,
        productId: id || null,
        payload: JSON.stringify(payload),
        processedAt: new Date().toISOString(),
        status: 'unhandled'
      });
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] Webhook procesado exitosamente en ${processingTime}ms`);

    // Retornar 200 para confirmar recepción (requerido por Tiendanube)
    return NextResponse.json({
      success: true,
      processingTime,
      requestId,
      duplicate: isDuplicate,
      processed: true
    }, { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error procesando webhook:`, error);
    console.error(`⏱️  Tiempo de procesamiento: ${processingTime}ms`);

    // Retornar 500 para que Tiendanube reintente
    return NextResponse.json(
      {
        error: 'Internal server error',
        processingTime,
        requestId
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'Webhook endpoint is running',
    timestamp: new Date().toISOString(),
    features: [
      'HMAC-SHA256 verification',
      'Idempotency handling',
      'LGPD webhooks support',
      'Product synchronization',
      'Order synchronization',
      'Detailed logging'
    ]
  });
}

// Configuración para deshabilitar el body parser automático
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
