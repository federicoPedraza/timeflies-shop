import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const countUniqueProducts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Obtener todos los productos del usuario
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("provider"), "tiendanube"))
      .collect();

    // Crear un Set para contar SKUs únicos
    const uniqueSkus = new Set<string>();

    products.forEach(product => {
      if (product.sku) {
        uniqueSkus.add(product.sku);
      }
    });

    return uniqueSkus.size;
  },
});

// Función para sincronizar productos de TiendaNube
export const syncTiendanubeProducts = mutation({
  args: {
    products: v.array(v.object({
      tiendanube_id: v.number(),
      tiendanube_product_id: v.number(),
      price: v.union(v.number(), v.null()),
      promotional_price: v.union(v.number(), v.null()),
      stock: v.number(),
      weight: v.union(v.number(), v.null()),
      tiendanube_sku: v.union(v.string(), v.null()),
      cost: v.union(v.number(), v.null()),
      created_at: v.string(),
      updated_at: v.string(),
      added_at: v.number(),
    })),
    storeId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Sync TiendaNube] Iniciando sincronización de ${args.products.length} productos`);

    const results = {
      added: 0,
      updated: 0,
      errors: 0,
      errors_details: [] as string[],
      products_synced: 0
    };

    for (const product of args.products) {
      try {
        // Buscar si el producto ya existe en tiendanube_products
        const existingTiendanubeProduct = await ctx.db
          .query("tiendanube_products")
          .filter((q) => q.eq(q.field("tiendanube_id"), product.tiendanube_id))
          .first();

        if (existingTiendanubeProduct) {
          // Actualizar producto existente en tiendanube_products
          await ctx.db.patch(existingTiendanubeProduct._id, {
            price: product.price,
            promotional_price: product.promotional_price,
            stock: product.stock,
            weight: product.weight,
            tiendanube_sku: product.tiendanube_sku,
            cost: product.cost,
            updated_at: product.updated_at,
          });
          results.updated++;
        } else {
          // Agregar nuevo producto en tiendanube_products
          await ctx.db.insert("tiendanube_products", {
            ...product,
            added_at: Date.now(),
            store_id: args.storeId,
          });
          results.added++;
        }

                // Verificar si existe en la tabla products
        const existingProduct = await ctx.db
          .query("products")
          .filter((q) =>
            q.and(
              q.eq(q.field("provider"), "tiendanube"),
              q.eq(q.field("item_id"), product.tiendanube_id)
            )
          )
          .first();

        if (!existingProduct) {
          // Generar SKU único para TimeFlies
          const timefliesSku = await generateTimefliesSku(ctx);

          // Crear entrada en la tabla products
          await ctx.db.insert("products", {
            sku: timefliesSku,
            provider: "tiendanube",
            item_id: product.tiendanube_id,
          });

          console.log(`🆕 [Sync TiendaNube] Nuevo producto registrado en products: ${timefliesSku} (TiendaNube ID: ${product.tiendanube_id})`);
          results.products_synced++;
        }

      } catch (error) {
        console.error(`❌ [Sync TiendaNube] Error procesando producto ${product.tiendanube_id}:`, error);
        results.errors++;
        results.errors_details.push(`Producto ${product.tiendanube_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`✅ [Sync TiendaNube] Sincronización completada: ${results.added} agregados, ${results.updated} actualizados, ${results.products_synced} productos sincronizados, ${results.errors} errores`);
    return results;
  },
});

// Función para generar SKU único de TimeFlies
async function generateTimefliesSku(ctx: any): Promise<string> {
  let counter = 1;
  let sku: string;

  do {
    sku = `timeflies-${counter.toString().padStart(4, '0')}`;
    const existingProduct = await ctx.db
      .query("products")
      .filter((q: any) => q.eq(q.field("sku"), sku))
      .first();

    if (!existingProduct) {
      return sku;
    }
    counter++;
  } while (counter <= 9999);

  throw new Error("No se pudo generar un SKU único");
}

// Función para limpiar productos que ya no existen en TiendaNube
export const cleanupTiendanubeProducts = mutation({
  args: {
    currentProductIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    console.log(`🧹 [Cleanup TiendaNube] Limpiando productos obsoletos. Productos actuales: ${args.currentProductIds.length}`);

    // Obtener todos los productos almacenados
    const storedProducts = await ctx.db.query("tiendanube_products").collect();

    const currentIdsSet = new Set(args.currentProductIds);
    let deletedCount = 0;
    const errors = [] as string[];

    for (const storedProduct of storedProducts) {
      if (!currentIdsSet.has(storedProduct.tiendanube_id)) {
        try {
          await ctx.db.delete(storedProduct._id);
          deletedCount++;
        } catch (error) {
          console.error(`❌ [Cleanup TiendaNube] Error eliminando producto ${storedProduct.tiendanube_id}:`, error);
          errors.push(`Producto ${storedProduct.tiendanube_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }

    console.log(`✅ [Cleanup TiendaNube] Limpieza completada: ${deletedCount} productos eliminados, ${errors.length} errores`);
    return {
      deleted: deletedCount,
      errors: errors.length,
      errors_details: errors
    };
  },
});

// Función para obtener estadísticas de sincronización
export const getSyncStats = query({
  args: {},
  handler: async (ctx) => {
    const totalProducts = await ctx.db.query("tiendanube_products").collect();

    return {
      total: totalProducts.length,
      withPrice: totalProducts.filter(p => p.price !== null).length,
      withStock: totalProducts.filter(p => p.stock > 0).length,
      lastSync: totalProducts.length > 0 ? Math.max(...totalProducts.map(p => p.added_at)) : null,
    };
  },
});

// Función para obtener estadísticas del dashboard
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Obtener todos los productos de TiendaNube
    const tiendanubeProducts = await ctx.db.query("tiendanube_products").collect();

    // Debug: Log para verificar que la query se está ejecutando
    console.log(`📊 [getDashboardStats] Total productos: ${tiendanubeProducts.length}`);

    // Contar productos activos (con stock > 0)
    const activeProducts = tiendanubeProducts.filter(product => product.stock > 0).length;

    console.log(`📊 [getDashboardStats] Productos activos: ${activeProducts}`);

    // Calcular estadísticas adicionales
    const totalRevenue = tiendanubeProducts.reduce((sum, product) => {
      const price = product.promotional_price || product.price || 0;
      return sum + (price * product.stock);
    }, 0);

    const totalOrders = 0; // TODO: Implementar cuando tengamos tabla de órdenes
    const totalClocksSold = tiendanubeProducts.reduce((sum, product) => sum + product.stock, 0);

    const result = {
      activeProducts,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Redondear a 2 decimales
      totalOrders,
      totalClocksSold,
      // Por ahora, retornamos valores placeholder para las tendencias
      // TODO: Implementar cálculo de tendencias cuando tengamos datos históricos
      trends: {
        revenue: "+20.1% from last month",
        orders: "+180.1% from last month",
        clocks: "+19% from last month",
        products: "-4.3% from last month"
      }
    };

    console.log(`📊 [getDashboardStats] Resultado:`, result);
    return result;
  },
});

// Función para obtener un producto por su ID de Tiendanube
export const getProductByTiendanubeId = query({
  args: {
    tiendanubeId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("tiendanube_id"), args.tiendanubeId))
      .first();
  },
});

// Función para actualizar un producto de Tiendanube
export const updateTiendanubeProduct = mutation({
  args: {
    productId: v.id("tiendanube_products"),
    updates: v.object({
      tiendanube_id: v.number(),
      tiendanube_product_id: v.number(),
      price: v.union(v.number(), v.null()),
      promotional_price: v.union(v.number(), v.null()),
      stock: v.number(),
      weight: v.union(v.number(), v.null()),
      tiendanube_sku: v.union(v.string(), v.null()),
      cost: v.union(v.number(), v.null()),
      created_at: v.string(),
      updated_at: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Update Tiendanube Product] Actualizando producto ${args.productId}`);

    await ctx.db.patch(args.productId, args.updates);

    console.log(`✅ [Update Tiendanube Product] Producto actualizado exitosamente`);
    return { success: true };
  },
});

// Función para crear un nuevo producto de Tiendanube
export const createTiendanubeProduct = mutation({
  args: {
    product: v.object({
      tiendanube_id: v.number(),
      tiendanube_product_id: v.number(),
      price: v.union(v.number(), v.null()),
      promotional_price: v.union(v.number(), v.null()),
      stock: v.number(),
      weight: v.union(v.number(), v.null()),
      tiendanube_sku: v.union(v.string(), v.null()),
      cost: v.union(v.number(), v.null()),
      created_at: v.string(),
      updated_at: v.string(),
      added_at: v.number(),
    }),
    storeId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🆕 [Create Tiendanube Product] Creando nuevo producto ${args.product.tiendanube_id}`);

    const productId = await ctx.db.insert("tiendanube_products", {
      ...args.product,
      store_id: args.storeId,
    });

    // Verificar si existe en la tabla products
    const existingProduct = await ctx.db
      .query("products")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "tiendanube"),
          q.eq(q.field("item_id"), args.product.tiendanube_id)
        )
      )
      .first();

    if (!existingProduct) {
      // Generar SKU único para TimeFlies
      const timefliesSku = await generateTimefliesSku(ctx);

      // Crear entrada en la tabla products
      await ctx.db.insert("products", {
        sku: timefliesSku,
        provider: "tiendanube",
        item_id: args.product.tiendanube_id,
      });

      console.log(`🆕 [Create Tiendanube Product] Nuevo producto registrado en products: ${timefliesSku}`);
    }

    console.log(`✅ [Create Tiendanube Product] Producto creado exitosamente`);
    return { success: true, productId };
  },
});

// Función para eliminar un producto de Tiendanube
export const deleteTiendanubeProduct = mutation({
  args: {
    productId: v.id("tiendanube_products"),
  },
  handler: async (ctx, args) => {
    console.log(`🗑️ [Delete Tiendanube Product] Eliminando producto ${args.productId}`);

    // Obtener el producto antes de eliminarlo para poder eliminar también de la tabla products
    const product = await ctx.db.get(args.productId);

    if (product) {
      // Eliminar de la tabla products si existe
      const existingProduct = await ctx.db
        .query("products")
        .filter((q) =>
          q.and(
            q.eq(q.field("provider"), "tiendanube"),
            q.eq(q.field("item_id"), product.tiendanube_id)
          )
        )
        .first();

      if (existingProduct) {
        await ctx.db.delete(existingProduct._id);
        console.log(`🗑️ [Delete Tiendanube Product] Producto eliminado de tabla products también`);
      }
    }

    // Eliminar de tiendanube_products
    await ctx.db.delete(args.productId);

    console.log(`✅ [Delete Tiendanube Product] Producto eliminado exitosamente`);
    return { success: true };
  },
});

// Función para eliminar todos los productos (LGPD)
export const deleteAllProducts = mutation({
  args: {},
  handler: async (ctx) => {
    console.log(`🗑️ [Delete All Products] Eliminando todos los productos`);

    // Obtener todos los productos
    const products = await ctx.db.query("tiendanube_products").collect();

    let deletedCount = 0;
    for (const product of products) {
      try {
        // Eliminar de la tabla products si existe
        const existingProduct = await ctx.db
          .query("products")
          .filter((q) =>
            q.and(
              q.eq(q.field("provider"), "tiendanube"),
              q.eq(q.field("item_id"), product.tiendanube_id)
            )
          )
          .first();

        if (existingProduct) {
          await ctx.db.delete(existingProduct._id);
        }

        // Eliminar de tiendanube_products
        await ctx.db.delete(product._id);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error eliminando producto ${product.tiendanube_id}:`, error);
      }
    }

    console.log(`✅ [Delete All Products] ${deletedCount} productos eliminados`);
    return { success: true, deletedCount };
  },
});

// Función para registrar webhooks (idempotencia)
export const logWebhook = mutation({
  args: {
    idempotencyKey: v.string(),
    storeId: v.number(),
    event: v.string(),
    productId: v.union(v.number(), v.null()),
    payload: v.string(),
    processedAt: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`📝 [Log Webhook] Registrando webhook: ${args.idempotencyKey}`);

    await ctx.db.insert("webhook_logs", {
      idempotencyKey: args.idempotencyKey,
      storeId: args.storeId,
      event: args.event,
      productId: args.productId,
      payload: args.payload,
      processedAt: args.processedAt,
      status: args.status || "processed",
      createdAt: Date.now(),
    });

    console.log(`✅ [Log Webhook] Webhook registrado exitosamente`);
    return { success: true };
  },
});

// Función para verificar si un webhook ya fue procesado
export const getWebhookLog = query({
  args: {
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("webhook_logs")
      .filter((q) => q.eq(q.field("idempotencyKey"), args.idempotencyKey))
      .first();
  },
});

// Función para upsertar un producto con datos completos
export const upsertProduct = mutation({
  args: {
    productData: v.any(), // Usar v.any() para flexibilidad con la estructura de Tiendanube
    storeId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Upsert Product] Procesando producto ${args.productData.id}`);

    // Buscar si el producto ya existe
    const existingProduct = await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("tiendanube_id"), args.productData.id))
      .first();

    const productUpdate = {
      tiendanube_id: args.productData.id,
      tiendanube_product_id: args.productData.id,
      price: args.productData.price || null,
      promotional_price: args.productData.promotional_price || null,
      stock: args.productData.stock || 0,
      weight: args.productData.weight || null,
      tiendanube_sku: args.productData.sku || null,
      cost: args.productData.cost || null,
      created_at: args.productData.created_at,
      updated_at: args.productData.updated_at,
      store_id: args.storeId,
    };

    if (existingProduct) {
      // Actualizar producto existente
      await ctx.db.patch(existingProduct._id, productUpdate);
      console.log(`✅ [Upsert Product] Producto actualizado: ${args.productData.id}`);
      return { status: 'updated', productId: existingProduct._id };
    } else {
      // Crear nuevo producto
      const newProductId = await ctx.db.insert("tiendanube_products", {
        ...productUpdate,
        added_at: Date.now(),
      });

      // Verificar si existe en la tabla products
      const existingTimefliesProduct = await ctx.db
        .query("products")
        .filter((q) =>
          q.and(
            q.eq(q.field("provider"), "tiendanube"),
            q.eq(q.field("item_id"), args.productData.id)
          )
        )
        .first();

      if (!existingTimefliesProduct) {
        // Generar SKU único para TimeFlies
        const timefliesSku = await generateTimefliesSku(ctx);

        // Crear entrada en la tabla products
        await ctx.db.insert("products", {
          sku: timefliesSku,
          provider: "tiendanube",
          item_id: args.productData.id,
        });

        console.log(`🆕 [Upsert Product] Nuevo producto registrado en products: ${timefliesSku}`);
      }

      console.log(`✅ [Upsert Product] Producto creado: ${args.productData.id}`);
      return { status: 'created', productId: newProductId };
    }
  },
});

// Función para upsertar un producto con datos básicos del webhook
export const upsertProductBasic = mutation({
  args: {
    productId: v.number(),
    event: v.string(),
    storeId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Upsert Product Basic] Procesando producto ${args.productId}`);

    // Buscar si el producto ya existe
    const existingProduct = await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("tiendanube_id"), args.productId))
      .first();

    if (existingProduct) {
      // Solo actualizar timestamp
      await ctx.db.patch(existingProduct._id, {
        updated_at: new Date().toISOString(),
      });
      console.log(`✅ [Upsert Product Basic] Producto actualizado: ${args.productId}`);
      return { status: 'updated', productId: existingProduct._id };
    } else {
      // Crear producto básico
      const newProductId = await ctx.db.insert("tiendanube_products", {
        tiendanube_id: args.productId,
        tiendanube_product_id: args.productId,
        price: null,
        promotional_price: null,
        stock: 0,
        weight: null,
        tiendanube_sku: null,
        cost: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        added_at: Date.now(),
        store_id: args.storeId,
      });

      console.log(`✅ [Upsert Product Basic] Producto básico creado: ${args.productId}`);
      return { status: 'created', productId: newProductId };
    }
  },
});

// Función para eliminar un producto por ID
export const deleteProduct = mutation({
  args: {
    productId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🗑️ [Delete Product] Eliminando producto ${args.productId}`);

    // Buscar el producto
    const existingProduct = await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("tiendanube_id"), args.productId))
      .first();

    if (existingProduct) {
      // Eliminar de la tabla products si existe
      const existingTimefliesProduct = await ctx.db
        .query("products")
        .filter((q) =>
          q.and(
            q.eq(q.field("provider"), "tiendanube"),
            q.eq(q.field("item_id"), args.productId)
          )
        )
        .first();

      if (existingTimefliesProduct) {
        await ctx.db.delete(existingTimefliesProduct._id);
        console.log(`🗑️ [Delete Product] Producto eliminado de tabla products también`);
      }

      // Eliminar de tiendanube_products
      await ctx.db.delete(existingProduct._id);
      console.log(`✅ [Delete Product] Producto eliminado: ${args.productId}`);
      return { status: 'deleted', productId: existingProduct._id };
    } else {
      console.log(`ℹ️ [Delete Product] Producto no encontrado: ${args.productId}`);
      return { status: 'not_found' };
    }
  },
});

// Función para actualizar productos existentes con store_id
export const updateExistingProductsWithStoreId = mutation({
  args: {
    storeId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Update Existing Products] Actualizando productos existentes con store_id: ${args.storeId}`);

    // Obtener todos los productos que no tienen store_id
    const productsWithoutStoreId = await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("store_id"), undefined))
      .collect();

    console.log(`📦 [Update Existing Products] Encontrados ${productsWithoutStoreId.length} productos sin store_id`);

    let updatedCount = 0;
    for (const product of productsWithoutStoreId) {
      try {
        await ctx.db.patch(product._id, {
          store_id: args.storeId,
        });
        updatedCount++;
      } catch (error) {
        console.error(`❌ [Update Existing Products] Error actualizando producto ${product.tiendanube_id}:`, error);
      }
    }

    console.log(`✅ [Update Existing Products] ${updatedCount} productos actualizados exitosamente`);
    return { success: true, updatedCount };
  },
});

// Función para actualizar un producto con datos del webhook de TiendaNube
export const updateProductFromWebhook = mutation({
  args: {
    productId: v.number(),
    productData: v.any(), // Datos del producto del webhook
    storeId: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Update Product From Webhook] Procesando producto ${args.productId}`);
    console.log(`📦 [Update Product From Webhook] ProductData recibido:`, JSON.stringify(args.productData, null, 2));

    // Buscar si el producto ya existe
    const existingProduct = await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("tiendanube_id"), args.productId))
      .first();

    console.log(`🔍 [Update Product From Webhook] Producto existente:`, existingProduct ? 'Sí' : 'No');

    // Extraer datos del producto del webhook
    // Los webhooks de TiendaNube pueden incluir datos del producto en diferentes formatos
    const rawPrice = args.productData.price || args.productData.variants?.[0]?.price;
    const rawPromotionalPrice = args.productData.promotional_price || args.productData.variants?.[0]?.promotional_price;
    const rawStock = args.productData.stock || args.productData.variants?.[0]?.stock;
    const rawWeight = args.productData.weight || args.productData.variants?.[0]?.weight;
    const rawSku = args.productData.sku || args.productData.variants?.[0]?.sku;
    const rawCost = args.productData.cost || args.productData.variants?.[0]?.cost;

    console.log(`🔍 [Update Product From Webhook] Valores extraídos del webhook:`);
    console.log(`   - price: ${rawPrice} (tipo: ${typeof rawPrice})`);
    console.log(`   - promotional_price: ${rawPromotionalPrice} (tipo: ${typeof rawPromotionalPrice})`);
    console.log(`   - stock: ${rawStock} (tipo: ${typeof rawStock})`);
    console.log(`   - weight: ${rawWeight} (tipo: ${typeof rawWeight})`);
    console.log(`   - sku: ${rawSku} (tipo: ${typeof rawSku})`);
    console.log(`   - cost: ${rawCost} (tipo: ${typeof rawCost})`);

    const productUpdate = {
      tiendanube_id: args.productId,
      tiendanube_product_id: args.productId,
      price: rawPrice,
      promotional_price: rawPromotionalPrice,
      stock: rawStock || 0,
      weight: rawWeight,
      tiendanube_sku: rawSku,
      cost: rawCost,
      updated_at: args.productData.updated_at || new Date().toISOString(),
      store_id: args.storeId,
    };

    // Convertir valores string a number cuando sea necesario
    console.log(`🔄 [Update Product From Webhook] Convirtiendo tipos de datos...`);

    if (typeof productUpdate.price === 'string') {
      const convertedPrice = parseFloat(productUpdate.price);
      console.log(`   - price: "${productUpdate.price}" -> ${convertedPrice} (${isNaN(convertedPrice) ? 'NaN' : 'number'})`);
      productUpdate.price = isNaN(convertedPrice) ? null : convertedPrice;
    }
    if (typeof productUpdate.promotional_price === 'string') {
      const convertedPromotionalPrice = parseFloat(productUpdate.promotional_price);
      console.log(`   - promotional_price: "${productUpdate.promotional_price}" -> ${convertedPromotionalPrice} (${isNaN(convertedPromotionalPrice) ? 'NaN' : 'number'})`);
      productUpdate.promotional_price = isNaN(convertedPromotionalPrice) ? null : convertedPromotionalPrice;
    }
    if (typeof productUpdate.stock === 'string') {
      const convertedStock = parseInt(productUpdate.stock);
      console.log(`   - stock: "${productUpdate.stock}" -> ${convertedStock} (${isNaN(convertedStock) ? 'NaN' : 'number'})`);
      productUpdate.stock = isNaN(convertedStock) ? 0 : convertedStock;
    }
    if (typeof productUpdate.weight === 'string') {
      const convertedWeight = parseFloat(productUpdate.weight);
      console.log(`   - weight: "${productUpdate.weight}" -> ${convertedWeight} (${isNaN(convertedWeight) ? 'NaN' : 'number'})`);
      productUpdate.weight = isNaN(convertedWeight) ? null : convertedWeight;
    }
    if (typeof productUpdate.cost === 'string') {
      const convertedCost = parseFloat(productUpdate.cost);
      console.log(`   - cost: "${productUpdate.cost}" -> ${convertedCost} (${isNaN(convertedCost) ? 'NaN' : 'number'})`);
      productUpdate.cost = isNaN(convertedCost) ? null : convertedCost;
    }

    console.log(`📊 [Update Product From Webhook] Valores finales para actualizar:`, JSON.stringify(productUpdate, null, 2));

    if (existingProduct) {
      // Mostrar estado actual del producto
      console.log(`📊 [Update Product From Webhook] Estado actual del producto:`, {
        price: existingProduct.price,
        promotional_price: existingProduct.promotional_price,
        stock: existingProduct.stock,
        weight: existingProduct.weight,
        tiendanube_sku: existingProduct.tiendanube_sku,
        cost: existingProduct.cost,
      });

      // Actualizar producto existente
      await ctx.db.patch(existingProduct._id, productUpdate);
      console.log(`✅ [Update Product From Webhook] Producto actualizado: ${args.productId}`);

      // Obtener el producto actualizado para verificar
      const updatedProduct = await ctx.db.get(existingProduct._id);
      console.log(`📊 [Update Product From Webhook] Estado después de la actualización:`, {
        price: updatedProduct?.price,
        promotional_price: updatedProduct?.promotional_price,
        stock: updatedProduct?.stock,
        weight: updatedProduct?.weight,
        tiendanube_sku: updatedProduct?.tiendanube_sku,
        cost: updatedProduct?.cost,
      });

      return { status: 'updated', productId: existingProduct._id };
    } else {
      // Crear nuevo producto si no existe
      const newProductId = await ctx.db.insert("tiendanube_products", {
        ...productUpdate,
        created_at: args.productData.created_at || new Date().toISOString(),
        added_at: Date.now(),
      });

      // Verificar si existe en la tabla products
      const existingTimefliesProduct = await ctx.db
        .query("products")
        .filter((q) =>
          q.and(
            q.eq(q.field("provider"), "tiendanube"),
            q.eq(q.field("item_id"), args.productId)
          )
        )
        .first();

      if (!existingTimefliesProduct) {
        // Generar SKU único para TimeFlies
        const timefliesSku = await generateTimefliesSku(ctx);

        // Crear entrada en la tabla products
        await ctx.db.insert("products", {
          sku: timefliesSku,
          provider: "tiendanube",
          item_id: args.productId,
        });

        console.log(`🆕 [Update Product From Webhook] Nuevo producto registrado en products: ${timefliesSku}`);
      }

      console.log(`✅ [Update Product From Webhook] Producto creado: ${args.productId}`);
      return { status: 'created', productId: newProductId };
    }
  },
});
