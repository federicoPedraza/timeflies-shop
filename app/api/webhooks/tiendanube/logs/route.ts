import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const event = searchParams.get('event');
    const storeId = searchParams.get('store_id');

    // En un entorno de producción, aquí podrías consultar una base de datos de logs
    // Por ahora, retornamos información sobre el endpoint de logs

    return NextResponse.json({
      message: 'Endpoint de logs de webhooks de Tiendanube',
      info: {
        endpoint: '/api/webhooks/tiendanube',
        storeId: storeId || 'No especificado',
        events: ['product:created', 'product:updated', 'product:deleted'],
        logging: 'Todos los webhooks se registran en la consola del servidor'
      },
      instructions: {
        viewLogs: 'Para ver los logs, revisa la consola del servidor donde se ejecuta la aplicación',
        filterLogs: 'Busca logs con el prefijo [Webhook Tiendanube]',
        testWebhook: 'Usa /api/webhooks/tiendanube/test para probar webhooks'
      },
      exampleLogs: [
        {
          timestamp: new Date().toISOString(),
          type: 'webhook_received',
          event: 'product:updated',
          productId: 12345,
          storeId: '6451847',
          status: 'success',
          processingTimeMs: 1250
        },
        {
          timestamp: new Date().toISOString(),
          type: 'webhook_received',
          event: 'product:created',
          productId: 12346,
          storeId: '6451847',
          status: 'success',
          processingTimeMs: 890
        }
      ]
    });

  } catch (error) {
    console.error('❌ [Webhook Logs] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log del request de logs
    console.log('📊 [Webhook Logs] Request de logs:', {
      timestamp: new Date().toISOString(),
      body,
      headers: Object.fromEntries(request.headers.entries())
    });

    return NextResponse.json({
      success: true,
      message: 'Log request registrado',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Webhook Logs] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
