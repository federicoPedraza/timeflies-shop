import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { event, productId, storeId } = await request.json();

    if (!event || !productId || !storeId) {
      return NextResponse.json(
        { error: 'event, productId y storeId son requeridos' },
        { status: 400 }
      );
    }

    // Simular el payload de un webhook de Tiendanube
    const webhookPayload = {
      type: 'product',
      event: event,
      data: {
        id: productId
      }
    };

    // Enviar el webhook al endpoint real
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/tiendanube?store_id=${storeId}`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tiendanube-signature': 'test-signature',
        'x-tiendanube-store-id': storeId
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ [Test Webhook] Webhook de prueba enviado exitosamente:', {
        event,
        productId,
        storeId,
        result
      });

      return NextResponse.json({
        success: true,
        message: 'Webhook de prueba enviado exitosamente',
        webhookPayload,
        result
      });
    } else {
      console.error('❌ [Test Webhook] Error enviando webhook de prueba:', result);

      return NextResponse.json({
        success: false,
        error: 'Error enviando webhook de prueba',
        details: result
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [Test Webhook] Error general:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de prueba para webhooks de Tiendanube',
    usage: {
      method: 'POST',
      body: {
        event: 'product:created | product:updated | product:deleted',
        productId: 'ID del producto',
        storeId: 'ID de la tienda'
      }
    },
    example: {
      event: 'product:updated',
      productId: 12345,
      storeId: 'tu-store-id'
    }
  });
}
