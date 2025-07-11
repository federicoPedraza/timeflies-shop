import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  console.log('🚀 [Products Count] Endpoint called');

  try {
    // Obtener el user_id del header
    const userId = request.headers.get('x-tiendanube-user-id');
    console.log('👤 [Products Count] User ID from header:', userId);

    if (!userId) {
      console.log('❌ [Products Count] Missing user ID');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Llamar a la función de Convex para contar productos únicos
    const uniqueProductCount = await convex.query(api.products.countUniqueProducts, {
      userId: userId
    });

    console.log('📊 [Products Count] Unique products count:', uniqueProductCount);

    return NextResponse.json({
      count: uniqueProductCount,
      success: true
    });

  } catch (error) {
    console.error('💥 [Products Count] Unexpected error:', error);
    console.error('💥 [Products Count] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: 'Failed to count products',
        success: false
      },
      { status: 500 }
    );
  }
}
