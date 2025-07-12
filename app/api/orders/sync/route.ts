import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('🔄 [Sync Orders] Endpoint called');

  try {
    const body = await request.json();
    const { provider = 'tiendanube' } = body;

    if (provider !== 'tiendanube') {
      return NextResponse.json(
        { error: 'Only tiendanube provider is supported' },
        { status: 400 }
      );
    }

    // Obtener el token de acceso desde las variables de entorno
    const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
    const storeId = process.env.TIENDANUBE_USER_ID;

    if (!accessToken || !storeId) {
      console.error('❌ [Sync Orders] TIENDANUBE_ACCESS_TOKEN o TIENDANUBE_USER_ID no están configurados');
      return NextResponse.json(
        { error: 'TiendaNube credentials not configured' },
        { status: 500 }
      );
    }

    console.log(`📦 [Sync Orders] Sincronizando órdenes para store ${storeId}`);

    // Obtener todas las órdenes de TiendaNube
    const tiendanubeResponse = await fetch(
      `https://api.tiendanube.com/2025-03/${storeId}/orders?per_page=100`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': `bearer ${accessToken}`,
        },
      }
    );

    if (!tiendanubeResponse.ok) {
      console.error(`❌ [Sync Orders] Error obteniendo órdenes de TiendaNube: ${tiendanubeResponse.status}`);
      const errorText = await tiendanubeResponse.text();
      console.error(`📄 [Sync Orders] Error response: ${errorText}`);
      return NextResponse.json(
        { error: `TiendaNube API error: ${tiendanubeResponse.status}` },
        { status: tiendanubeResponse.status }
      );
    }

    const ordersData = await tiendanubeResponse.json();
    console.log(`📊 [Sync Orders] ${ordersData.length} órdenes obtenidas de TiendaNube`);

    const results = {
      total: ordersData.length,
      added: 0,
      updated: 0,
      errors: 0,
      errors_details: [] as string[],
      orders_synced: 0,
      products_processed: 0
    };

    // Procesar cada orden
    for (const orderData of ordersData) {
      try {
        console.log(`📝 [Sync Orders] Procesando orden ${orderData.id}`);

            // Limpiar y preparar los datos para Convex
    const cleanedOrderData = {
      ...orderData,
      // Asegurar que los campos de fecha sean strings
      completed_at: orderData.completed_at ?
        (typeof orderData.completed_at === 'object' ? JSON.stringify(orderData.completed_at) : orderData.completed_at) :
        null,
      cancelled_at: orderData.cancelled_at ?
        (typeof orderData.cancelled_at === 'object' ? JSON.stringify(orderData.cancelled_at) : orderData.cancelled_at) :
        null,
      closed_at: orderData.closed_at ?
        (typeof orderData.closed_at === 'object' ? JSON.stringify(orderData.closed_at) : orderData.closed_at) :
        null,
      read_at: orderData.read_at ?
        (typeof orderData.read_at === 'object' ? JSON.stringify(orderData.read_at) : orderData.read_at) :
        null,
      paid_at: orderData.paid_at ?
        (typeof orderData.paid_at === 'object' ? JSON.stringify(orderData.paid_at) : orderData.paid_at) :
        null,
      // Asegurar que los campos opcionales sean strings o null
      discount_coupon: orderData.discount_coupon || null,
      contact_phone: orderData.contact_phone || null,
      contact_identification: orderData.contact_identification || null,
      billing_phone: orderData.billing_phone || null,
      billing_floor: orderData.billing_floor || null,
      billing_customer_type: orderData.billing_customer_type || null,
      billing_business_activity: orderData.billing_business_activity || null,
      billing_business_name: orderData.billing_business_name || null,
      billing_trade_name: orderData.billing_trade_name || null,
      billing_state_registration: orderData.billing_state_registration || null,
      billing_fiscal_regime: orderData.billing_fiscal_regime || null,
      billing_invoice_use: orderData.billing_invoice_use || null,
      billing_document_type: orderData.billing_document_type || null,
      gateway_id: orderData.gateway_id || null,
      cancel_reason: orderData.cancel_reason || null,
      owner_note: orderData.owner_note || null,
      gateway_link: orderData.gateway_link || null,
      app_id: orderData.app_id || null,
    };

        // Guardar la orden en tiendanube_orders
        const upsertResult = await convex.mutation(api.orders.upsertTiendanubeOrder, {
          orderData: cleanedOrderData
        });

        if (upsertResult.action === 'created') {
          results.added++;
        } else {
          results.updated++;
        }

        // Procesar cada producto de la orden y crear registros en la tabla orders
        if (orderData.products && Array.isArray(orderData.products)) {
          for (const product of orderData.products) {
            try {
              // Buscar el producto en nuestra tabla products
              const productRecord = await convex.query(api.products.getProductByTiendanubeId, {
                tiendanubeId: product.product_id
              });

              if (productRecord) {
                // Buscar el registro correspondiente en la tabla products
                const timefliesProduct = await convex.query(api.products.getProductByItemId, {
                  itemId: product.product_id
                });

                if (timefliesProduct) {
                  // Determinar el estado basado en payment_status y status
                  let state: "unpaid" | "paid" | "pending" | "cancelled" = "pending";

                  if (orderData.payment_status === "paid") {
                    state = "paid";
                  } else if (orderData.payment_status === "pending") {
                    state = "pending";
                  } else if (orderData.status === "cancelled" || orderData.cancelled_at) {
                    state = "cancelled";
                  } else {
                    state = "unpaid";
                  }

                  // Usar upsertOrder para crear o actualizar la orden
                  const upsertResult = await convex.mutation(api.orders.upsertOrder, {
                    provider: "tiendanube",
                    product_id: timefliesProduct._id,
                    provider_order_id: orderData.id.toString(),
                    created_at: orderData.created_at,
                    updated_at: orderData.updated_at,
                    state: state,
                  });

                  if (upsertResult.action === "created") {
                    results.products_processed++;
                    console.log(`✅ [Sync Orders] Orden creada para producto ${product.product_id}`);
                  } else {
                    console.log(`✅ [Sync Orders] Orden actualizada para producto ${product.product_id}`);
                  }
                } else {
                  console.warn(`⚠️ [Sync Orders] Producto ${product.product_id} no encontrado en tabla products`);
                }
              } else {
                console.warn(`⚠️ [Sync Orders] Producto ${product.product_id} no encontrado en nuestra base de datos`);
              }
            } catch (error) {
              console.error(`❌ [Sync Orders] Error procesando producto ${product.product_id}:`, error);
              results.errors++;
              results.errors_details.push(`Producto ${product.product_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        }

        results.orders_synced++;

      } catch (error) {
        console.error(`❌ [Sync Orders] Error procesando orden ${orderData.id}:`, error);
        results.errors++;
        results.errors_details.push(`Orden ${orderData.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`✅ [Sync Orders] Sincronización completada:`, results);

    // Limpiar duplicados existentes antes del refresco
    console.log(`🧹 [Sync Orders] Limpiando duplicados existentes...`);
    const cleanupResult = await convex.mutation(api.orders.cleanupDuplicateOrders);
    console.log(`✅ [Sync Orders] Limpieza de duplicados completada:`, cleanupResult);

    // Refrescar órdenes locales basándose en los datos de tiendanube_orders
    console.log(`🔄 [Sync Orders] Refrescando órdenes locales...`);
    const refreshResult = await convex.mutation(api.orders.refreshLocalOrders);
    console.log(`✅ [Sync Orders] Refresco local completado:`, refreshResult);

    return NextResponse.json({
      success: true,
      summary: {
        ...results,
        cleanup: cleanupResult,
        local_refresh: refreshResult
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Sync Orders] Error en sincronización:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
