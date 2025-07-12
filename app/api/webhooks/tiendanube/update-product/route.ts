import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  console.log('🔄 [Update Product Webhook] Endpoint called');

  try {
    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.log('❌ [Update Product Webhook] NEXT_PUBLIC_CONVEX_URL not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_CONVEX_URL not configured' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(convexUrl);
    const { productId, storeId } = await request.json();

    if (!productId || !storeId) {
      console.log('❌ [Update Product Webhook] Missing required parameters');
      return NextResponse.json(
        { error: 'productId and storeId are required' },
        { status: 400 }
      );
    }

    console.log(`📦 [Update Product Webhook] Actualizando producto ${productId} para store ${storeId}`);

    // Obtener el access token del .env
    const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('❌ [Update Product Webhook] No access token found in .env');
      return NextResponse.json(
        { error: 'TIENDANUBE_ACCESS_TOKEN not configured in .env' },
        { status: 500 }
      );
    }

    // Hacer llamada a la API de TiendaNube para obtener los datos completos del producto
    const tiendanubeUrl = `https://api.tiendanube.com/2025-03/${storeId}/products/${productId}`;
    console.log(`🌐 [Update Product Webhook] Llamando a TiendaNube: ${tiendanubeUrl}`);

    const tiendanubeResponse = await fetch(tiendanubeUrl, {
      method: 'GET',
      headers: {
        'Authentication': `bearer ${accessToken}`,
        'User-Agent': 'TimeFlies Development Team (federico.pedraza4@gmail.com)',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    if (!tiendanubeResponse.ok) {
      console.error(`❌ [Update Product Webhook] Error API TiendaNube: ${tiendanubeResponse.status} ${tiendanubeResponse.statusText}`);
      const errorText = await tiendanubeResponse.text();
      console.error(`❌ [Update Product Webhook] Error response body:`, errorText);
      return NextResponse.json(
        { error: `Error obteniendo producto de TiendaNube: ${tiendanubeResponse.status}` },
        { status: 500 }
      );
    }

    const productData = await tiendanubeResponse.json();
    console.log(`📦 [Update Product Webhook] Datos del producto obtenidos:`, JSON.stringify(productData, null, 2));

    // Extraer datos de la primera variante (asumiendo que es la principal)
    const variant = productData.variants?.[0];

    // Get the primary language name (prefer Spanish, then English, then Portuguese)
    const name = productData.name?.es || productData.name?.en || productData.name?.pt || null;

    // Get description in the same language preference
    const description = productData.description ?
      (productData.description.es || productData.description.en || productData.description.pt) : null;

    // Get handle in the same language preference
    const handle = productData.handle ?
      (productData.handle.es || productData.handle.en || productData.handle.pt) : null;

    const productUpdate = {
      tiendanube_id: productId,
      tiendanube_product_id: productId,
      // Basic product info
      name: name,
      description: description,
      handle: handle,
      seo_title: productData.seo_title || null,
      seo_description: productData.seo_description || null,
      published: productData.published ?? null,
      free_shipping: productData.free_shipping ?? null,
      video_url: productData.video_url || null,
      tags: productData.tags || null,
      brand: productData.brand || null,
      // Variant info (from first variant)
      price: variant?.price ? parseFloat(variant.price) : null,
      promotional_price: variant?.promotional_price ? parseFloat(variant.promotional_price) : null,
      stock: variant?.stock || 0,
      weight: variant?.weight ? parseFloat(variant.weight) : null,
      tiendanube_sku: variant?.sku || null,
      cost: variant?.cost ? parseFloat(variant.cost) : null,
      created_at: productData.created_at || new Date().toISOString(),
      updated_at: productData.updated_at || new Date().toISOString(),
    };

    console.log(`📊 [Update Product Webhook] Valores extraídos:`, JSON.stringify(productUpdate, null, 2));

    // Buscar si el producto ya existe en Convex
    const existingProduct = await convex.query(api.products.getProductByTiendanubeId, {
      tiendanubeId: productId
    });

    let result;
    if (existingProduct) {
      // Mostrar estado actual del producto
      console.log(`📊 [Update Product Webhook] Estado actual del producto:`, {
        price: existingProduct.price,
        promotional_price: existingProduct.promotional_price,
        stock: existingProduct.stock,
        weight: existingProduct.weight,
        tiendanube_sku: existingProduct.tiendanube_sku,
        cost: existingProduct.cost,
      });

      // Actualizar producto existente
      result = await convex.mutation(api.products.updateTiendanubeProduct, {
        productId: existingProduct._id,
        updates: productUpdate,
      });

      console.log(`✅ [Update Product Webhook] Producto actualizado: ${productId}`);
    } else {
      // Crear nuevo producto
      result = await convex.mutation(api.products.createTiendanubeProduct, {
        product: {
          ...productUpdate,
          created_at: productData.created_at || new Date().toISOString(),
          added_at: Date.now(),
        },
        storeId: storeId,
      });

      console.log(`✅ [Update Product Webhook] Producto creado: ${productId}`);
    }

    console.log('✅ [Update Product Webhook] Producto actualizado exitosamente:', result);
    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('❌ [Update Product Webhook] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update product',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
