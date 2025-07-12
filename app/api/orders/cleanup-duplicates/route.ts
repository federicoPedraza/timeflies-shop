import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('🧹 [Cleanup Duplicate Orders] Endpoint called');

  try {
    // Limpiar duplicados de órdenes
    console.log(`🧹 [Cleanup Duplicate Orders] Iniciando limpieza de duplicados...`);
    const cleanupResult = await convex.mutation(api.orders.cleanupDuplicateOrders);
    console.log(`✅ [Cleanup Duplicate Orders] Limpieza completada:`, cleanupResult);

    return NextResponse.json({
      success: true,
      summary: cleanupResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Cleanup Duplicate Orders] Error en limpieza:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
