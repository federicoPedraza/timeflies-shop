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

      } catch (error) {
        console.error(`❌ [Sync Orders] Error procesando orden ${orderData.id}:`, error);
        results.errors++;
        results.errors_details.push(`Orden ${orderData.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`✅ [Sync Orders] Sincronización completada:`, results);

    return NextResponse.json({
      success: true,
      summary: results,
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
