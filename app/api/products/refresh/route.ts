import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { TiendanubeProvider } from '../../../../thirdparties/tiendanube/provider';

export async function POST(request: NextRequest) {
  console.log('🔄 [Products Refresh] Endpoint called');

  try {
    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.log('❌ [Products Refresh] NEXT_PUBLIC_CONVEX_URL not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_CONVEX_URL not configured' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(convexUrl);
    // Obtener el user_id del .env o del header como fallback
    let userId = process.env.TIENDANUBE_USER_ID;
    if (!userId) {
      userId = request.headers.get('x-tiendanube-user-id') || undefined;
    }
    console.log('👤 [Products Refresh] User ID:', userId);

    if (!userId) {
      console.log('❌ [Products Refresh] Missing user ID');
      return NextResponse.json(
        { error: 'TIENDANUBE_USER_ID not configured in .env or provided in header' },
        { status: 400 }
      );
    }

    // Parsear el body de la request
    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      console.log('❌ [Products Refresh] Missing provider parameter');
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    // Validar que el proveedor sea soportado
    if (provider !== 'tiendanube') {
      console.log(`❌ [Products Refresh] Unsupported provider: ${provider}`);
      return NextResponse.json(
        { error: `Provider '${provider}' is not supported. Currently only 'tiendanube' is supported.` },
        { status: 400 }
      );
    }

    console.log(`🔄 [Products Refresh] Starting refresh for provider: ${provider}`);

    // Usar el access token del .env
    const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('❌ [Products Refresh] No access token found in .env');
      return NextResponse.json(
        { error: 'TIENDANUBE_ACCESS_TOKEN not configured in .env' },
        { status: 500 }
      );
    }

    // Obtener configuración del proveedor usando los tokens del usuario
    const providerConfig = getProviderConfig(provider, userId, accessToken);
    if (!providerConfig) {
      console.log('❌ [Products Refresh] Invalid provider configuration');
      return NextResponse.json(
        { error: 'Invalid provider configuration' },
        { status: 500 }
      );
    }

    // Crear instancia del proveedor
    const providerInstance = createProvider(provider, providerConfig);
    if (!providerInstance) {
      console.log('❌ [Products Refresh] Failed to create provider instance');
      return NextResponse.json(
        { error: 'Failed to create provider instance' },
        { status: 500 }
      );
    }

    // Obtener productos del proveedor
    console.log('📦 [Products Refresh] Fetching products from provider...');
    const products = await providerInstance.getProducts();
    console.log(`📦 [Products Refresh] Fetched ${products.length} products from ${provider}`);

    // Log detallado de los primeros 3 productos para debugging
    console.log('🔍 [Products Refresh] Sample products data:');
    products.slice(0, 3).forEach((product, index) => {
      console.log(`📦 [Products Refresh] Product ${index + 1}:`, JSON.stringify(product, null, 2));
    });

    // Convertir productos al formato de la base de datos
    const dbProducts = products.map(product => ({
      tiendanube_id: product.tiendanube_id!,
      tiendanube_product_id: product.tiendanube_product_id!,
      // Basic product info
      name: product.name ?? null,
      description: product.description ?? null,
      handle: product.handle ?? null,
      seo_title: product.seo_title ?? null,
      seo_description: product.seo_description ?? null,
      published: product.published ?? null,
      free_shipping: product.free_shipping ?? null,
      video_url: product.video_url ?? null,
      tags: product.tags ?? null,
      brand: product.brand ?? null,
      // Variant info (from first variant)
      price: product.price ?? null,
      promotional_price: product.promotional_price ?? null,
      stock: product.stock ?? 0,
      weight: product.weight ?? null,
      tiendanube_sku: product.tiendanube_sku ?? null,
      cost: product.cost ?? null,
      created_at: product.created_at!,
      updated_at: product.updated_at!,
      added_at: Date.now(),
    }));

    // Sincronizar productos en la base de datos
    console.log('💾 [Products Refresh] Syncing products to database...');
    const syncResult = await convex.mutation(api.products.syncTiendanubeProducts, {
      products: dbProducts,
      storeId: Number(userId)
    });

    // Fetch and sync product images
    console.log('🖼️ [Products Refresh] Fetching and syncing product images...');
    const allImages: any[] = [];

    for (const product of products) {
      try {
        if (product.tiendanube_id) {
          const images = await providerInstance.getProductImages(product.tiendanube_id);
          const dbImages = images.map(image => ({
            tiendanube_id: image.id,
            product_id: image.product_id,
            src: image.src,
            position: image.position,
            alt: Array.isArray(image.alt) ? null : (image.alt || null),
            created_at: image.created_at,
            updated_at: image.updated_at,
            added_at: Date.now(),
          }));
          allImages.push(...dbImages);
        }
      } catch (error) {
        console.error(`❌ [Products Refresh] Error fetching images for product ${product.tiendanube_id}:`, error);
      }
    }

    // Sync images to database
    let imageSyncResult: { added: number; updated: number; errors: number; errors_details: string[] } = { added: 0, updated: 0, errors: 0, errors_details: [] };
    if (allImages.length > 0) {
      console.log(`🖼️ [Products Refresh] Syncing ${allImages.length} images to database...`);
      imageSyncResult = await convex.mutation(api.products.syncTiendanubeProductImages, {
        images: allImages
      });
    }

    // Limpiar productos obsoletos
    console.log('🧹 [Products Refresh] Cleaning up obsolete products...');
    const currentProductIds = products.map(p => p.tiendanube_id!).filter(id => id !== undefined);
    const cleanupResult = await convex.mutation(api.products.cleanupTiendanubeProducts, {
      currentProductIds
    });

    // Obtener estadísticas finales
    const stats = await convex.query(api.products.getSyncStats);

    const result = {
      success: true,
      provider,
      sync: syncResult,
      imageSync: imageSyncResult,
      cleanup: cleanupResult,
      stats,
      summary: {
        total_products: products.length,
        total_images: allImages.length,
        added: syncResult.added,
        updated: syncResult.updated,
        images_added: imageSyncResult.added,
        images_updated: imageSyncResult.updated,
        deleted: cleanupResult.deleted,
        errors: syncResult.errors + cleanupResult.errors + imageSyncResult.errors
      }
    };

    console.log('✅ [Products Refresh] Refresh completed successfully:', result.summary);
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 [Products Refresh] Unexpected error:', error);
    console.error('💥 [Products Refresh] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: 'Failed to refresh products',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getProviderConfig(provider: string, userId: string, accessToken: string) {
  if (provider === 'tiendanube') {
    return {
      appId: userId, // Para TiendaNube, el appId es el userId
      accessToken: accessToken,
      userAgent: process.env.TIENDANUBE_USER_AGENT || 'TimeFlies-App/1.0',
    };
  }
  return null;
}

function createProvider(provider: string, config: { appId: string; accessToken: string; userAgent: string }) {
  if (provider === 'tiendanube') {
    return new TiendanubeProvider(config);
  }
  return null;
}
