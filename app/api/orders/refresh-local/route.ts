import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('🔄 [Refresh Local Orders] Endpoint called');

  try {
    // Refrescar órdenes locales basándose en los datos de tiendanube_orders
    console.log(`🔄 [Refresh Local Orders] Iniciando refresco de órdenes locales...`);
    const refreshResult = await convex.mutation(api.orders.refreshLocalOrders);
    console.log(`✅ [Refresh Local Orders] Refresco completado:`, refreshResult);

    return NextResponse.json({
      success: true,
      summary: refreshResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Refresh Local Orders] Error en refresco:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
