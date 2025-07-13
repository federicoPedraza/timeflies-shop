import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getUserCredentials } from '../../../../../lib/tiendanube-auth';

export async function POST(request: NextRequest) {
  console.log('🔄 [Update Order Webhook] Endpoint called');

  try {
    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.log('❌ [Update Order Webhook] NEXT_PUBLIC_CONVEX_URL not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_CONVEX_URL not configured' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(convexUrl);
    const body = await request.json();
    const { orderId, storeId } = body;

    if (!orderId || !storeId) {
      console.error('❌ [Update Order Webhook] Faltan parámetros requeridos');
      return NextResponse.json(
        { error: 'Missing required parameters: orderId, storeId' },
        { status: 400 }
      );
    }

    console.log(`📦 [Update Order Webhook] Obteniendo orden ${orderId} para store ${storeId}`);

    // Get user credentials from Convex
    const credentials = await getUserCredentials(storeId.toString());
    if (!credentials) {
      console.log('❌ [Update Order Webhook] No credentials found for store:', storeId);
      return NextResponse.json(
        { error: 'Store credentials not found. Please re-authenticate.' },
        { status: 401 }
      );
    }

    // Llamar a la API de TiendaNube para obtener los datos completos de la orden
    const tiendanubeResponse = await fetch(
      `https://api.tiendanube.com/2025-03/${storeId}/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': `bearer ${credentials.access_token}`,
        },
      }
    );

    if (!tiendanubeResponse.ok) {
      console.error(`❌ [Update Order Webhook] Error obteniendo orden de TiendaNube: ${tiendanubeResponse.status}`);
      const errorText = await tiendanubeResponse.text();
      console.error(`📄 [Update Order Webhook] Error response: ${errorText}`);
      return NextResponse.json(
        { error: `TiendaNube API error: ${tiendanubeResponse.status}` },
        { status: tiendanubeResponse.status }
      );
    }

    const orderData = await tiendanubeResponse.json();
    console.log(`📊 [Update Order Webhook] Datos de la orden obtenidos:`, {
      id: orderData.id,
      contact_name: orderData.contact_name,
      contact_email: orderData.contact_email,
      total: orderData.total,
      currency: orderData.currency,
      status: orderData.status,
      payment_status: orderData.payment_status,
      products_count: orderData.products?.length || 0,
    });

    // Limpiar y preparar los datos para Convex
    const cleanedOrderData = {
      ...orderData,
      // Convertir store_id a número
      store_id: parseInt(storeId),
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

    console.log(`✅ [Update Order Webhook] Orden guardada en tiendanube_orders:`, upsertResult);

    console.log(`✅ [Update Order Webhook] Orden procesada exitosamente: ${orderId}`);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      action: upsertResult.action,
      productsCount: orderData.products?.length || 0,
    });

  } catch (error) {
    console.error('❌ [Update Order Webhook] Error procesando orden:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
