import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('🔄 [Update Store ID] Endpoint called');

  try {
    // Obtener el user_id del header
    const userId = request.headers.get('x-tiendanube-user-id');
    console.log('👤 [Update Store ID] User ID from header:', userId);

    if (!userId) {
      console.log('❌ [Update Store ID] Missing user ID');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const storeId = Number(userId);
    console.log(`🔄 [Update Store ID] Updating products with store_id: ${storeId}`);

    // Actualizar productos existentes con store_id
    const result = await convex.mutation(api.products.updateExistingProductsWithStoreId, {
      storeId
    });

    console.log('✅ [Update Store ID] Update completed successfully:', result);
    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('💥 [Update Store ID] Unexpected error:', error);
    console.error('💥 [Update Store ID] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: 'Failed to update products with store_id',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar que está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'Update Store ID endpoint is running',
    timestamp: new Date().toISOString(),
    description: 'Updates existing products with store_id field'
  });
}
