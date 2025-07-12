import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Función para sincronizar productos de TiendaNube
export const syncTiendanubeProducts = mutation({
  args: {
    products: v.array(v.object({
      tiendanube_id: v.number(),
      tiendanube_product_id: v.number(),
      // Basic product info
      name: v.union(v.string(), v.null()),
      description: v.union(v.string(), v.null()),
      handle: v.union(v.string(), v.null()),
      seo_title: v.union(v.string(), v.null()),
      seo_description: v.union(v.string(), v.null()),
      published: v.union(v.boolean(), v.null()),
      free_shipping: v.union(v.boolean(), v.null()),
      video_url: v.union(v.string(), v.null()),
      tags: v.union(v.string(), v.null()),
      brand: v.union(v.string(), v.null()),
      // Variant info (from first variant)
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
          const updateData: any = {
            price: product.price,
            promotional_price: product.promotional_price,
            stock: product.stock,
            weight: product.weight,
            tiendanube_sku: product.tiendanube_sku,
            cost: product.cost,
            updated_at: product.updated_at,
          };

          // Only update new fields if they are provided
          if (product.name !== undefined) updateData.name = product.name;
          if (product.description !== undefined) updateData.description = product.description;
          if (product.handle !== undefined) updateData.handle = product.handle;
          if (product.seo_title !== undefined) updateData.seo_title = product.seo_title;
          if (product.seo_description !== undefined) updateData.seo_description = product.seo_description;
          if (product.published !== undefined) updateData.published = product.published;
          if (product.free_shipping !== undefined) updateData.free_shipping = product.free_shipping;
          if (product.video_url !== undefined) updateData.video_url = product.video_url;
          if (product.tags !== undefined) updateData.tags = product.tags;
          if (product.brand !== undefined) updateData.brand = product.brand;

          await ctx.db.patch(existingTiendanubeProduct._id, updateData);
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

      } catch (error) {
        console.error(`❌ [Sync TiendaNube] Error procesando producto ${product.tiendanube_id}:`, error);
        results.errors++;
        results.errors_details.push(`Producto ${product.tiendanube_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`✅ [Sync TiendaNube] Sincronización completada: ${results.added} agregados, ${results.updated} actualizados, ${results.errors} errores`);
    return results;
  },
});

// Función para sincronizar imágenes de productos de TiendaNube
export const syncTiendanubeProductImages = mutation({
  args: {
    images: v.array(v.object({
      tiendanube_id: v.number(),
      product_id: v.number(),
      src: v.string(),
      position: v.number(),
      alt: v.union(v.string(), v.null()),
      created_at: v.string(),
      updated_at: v.string(),
      added_at: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Sync TiendaNube Images] Iniciando sincronización de ${args.images.length} imágenes`);

    const results = {
      added: 0,
      updated: 0,
      errors: 0,
      errors_details: [] as string[],
    };

    for (const image of args.images) {
      try {
        // Buscar si la imagen ya existe
        const existingImage = await ctx.db
          .query("tiendanube_product_images")
          .filter((q) => q.eq(q.field("tiendanube_id"), image.tiendanube_id))
          .first();

        if (existingImage) {
          // Actualizar imagen existente
          await ctx.db.patch(existingImage._id, {
            src: image.src,
            position: image.position,
            alt: image.alt,
            updated_at: image.updated_at,
          });
          results.updated++;
        } else {
          // Agregar nueva imagen
          await ctx.db.insert("tiendanube_product_images", {
            ...image,
            added_at: Date.now(),
          });
          results.added++;
        }

      } catch (error) {
        console.error(`❌ [Sync TiendaNube Images] Error procesando imagen ${image.tiendanube_id}:`, error);
        results.errors++;
        results.errors_details.push(`Imagen ${image.tiendanube_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`✅ [Sync TiendaNube Images] Sincronización completada: ${results.added} agregadas, ${results.updated} actualizadas, ${results.errors} errores`);
    return results;
  },
});

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
    // Obtener todos los productos de Tiendanube
    const tiendanubeProducts = await ctx.db.query("tiendanube_products").collect();

    // Debug: Log para verificar que la query se está ejecutando
    console.log(`📊 [getDashboardStats] Total productos: ${tiendanubeProducts.length}`);

    // Debug: Verificar productos con costos
    const productsWithCost = tiendanubeProducts.filter(p => p.cost !== null);
    console.log(`📊 [getDashboardStats] Productos con costo: ${productsWithCost.length}`);
    if (productsWithCost.length > 0) {
      console.log(`📊 [getDashboardStats] Ejemplos de costos:`, productsWithCost.slice(0, 3).map(p => ({
        id: p.tiendanube_id,
        cost: p.cost,
        price: p.price
      })));
    }

    // Contar productos activos (con stock > 0)
    const activeProducts = tiendanubeProducts.filter(product => product.stock > 0).length;

    console.log(`📊 [getDashboardStats] Productos activos: ${activeProducts}`);

    // Obtener todas las órdenes
    const orders = await ctx.db.query("tiendanube_orders").collect();
    const totalOrders = orders.length;

    // Calcular revenue total basado en órdenes pagadas
    let totalRevenue = 0;
    let totalClocksSold = 0;

    // Filtrar solo órdenes pagadas
    const paidOrders = orders.filter(order => order.payment_status === "paid");

    console.log(`📊 [getDashboardStats] Órdenes pagadas: ${paidOrders.length} de ${totalOrders}`);

    for (const order of paidOrders) {
      try {
        // Parsear los productos de la orden
        const productsData = JSON.parse(order.products);

        for (const product of productsData) {
          const productId = product.id || product.product_id;
          const quantity = product.quantity || 1;
          const price = parseFloat(product.price || "0") / 100; // Convertir de centavos

          // Buscar el producto en la base de datos para obtener el costo
          const dbProduct = tiendanubeProducts.find(p => p.tiendanube_id === parseInt(productId));

          if (dbProduct && dbProduct.cost) {
            // Calcular revenue basado en el precio de venta (no el costo)
            const revenue = price * quantity; // Revenue es el precio de venta, no la ganancia
            totalRevenue += revenue;
            totalClocksSold += quantity;
          } else {
            // Si no encontramos el producto o no tiene costo, usar el precio como revenue
            totalRevenue += price * quantity;
            totalClocksSold += quantity;
          }
        }
      } catch (error) {
        console.error(`❌ [getDashboardStats] Error procesando orden ${order.tiendanube_id}:`, error);
        // Si hay error al parsear, usar el total de la orden
        const orderTotal = parseFloat(order.total || "0") / 100;
        totalRevenue += orderTotal;
      }
    }

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

// Función para calcular tendencias reales basadas en datos históricos
export const getTrends = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000); // 30 días atrás

    // Obtener productos y órdenes
    const products = await ctx.db.query("tiendanube_products").collect();
    const orders = await ctx.db.query("tiendanube_orders").collect();

    // Filtrar órdenes del mes actual y del mes anterior
    const currentMonthOrders = orders.filter(order => order.added_at >= oneMonthAgo);
    const previousMonthOrders = orders.filter(order =>
      order.added_at >= oneMonthAgo - (30 * 24 * 60 * 60 * 1000) &&
      order.added_at < oneMonthAgo
    );

    // Calcular métricas del mes actual
    const currentPaidOrders = currentMonthOrders.filter(order => order.payment_status === "paid");
        const currentRevenue = currentPaidOrders.reduce((sum, order) => {
      try {
        const productsData = JSON.parse(order.products);
        return sum + productsData.reduce((orderSum: number, product: any) => {
          const price = parseFloat(product.price || "0") / 100;
          const quantity = product.quantity || 1;
          return orderSum + (price * quantity);
        }, 0);
      } catch (error) {
        return sum + parseFloat(order.total || "0") / 100;
      }
    }, 0);

    const currentClocksSold = currentPaidOrders.reduce((sum, order) => {
      try {
        const productsData = JSON.parse(order.products);
        return sum + productsData.reduce((orderSum: number, product: any) => {
          return orderSum + (product.quantity || 1);
        }, 0);
      } catch (error) {
        return sum;
      }
    }, 0);

    const currentActiveProducts = products.filter(product =>
      product.stock > 0 && product.added_at >= oneMonthAgo
    ).length;

    // Calcular métricas del mes anterior
    const previousPaidOrders = previousMonthOrders.filter(order => order.payment_status === "paid");
        const previousRevenue = previousPaidOrders.reduce((sum, order) => {
      try {
        const productsData = JSON.parse(order.products);
        return sum + productsData.reduce((orderSum: number, product: any) => {
          const price = parseFloat(product.price || "0") / 100;
          const quantity = product.quantity || 1;
          return orderSum + (price * quantity);
        }, 0);
      } catch (error) {
        return sum + parseFloat(order.total || "0") / 100;
      }
    }, 0);

    const previousClocksSold = previousPaidOrders.reduce((sum, order) => {
      try {
        const productsData = JSON.parse(order.products);
        return sum + productsData.reduce((orderSum: number, product: any) => {
          return orderSum + (product.quantity || 1);
        }, 0);
      } catch (error) {
        return sum;
      }
    }, 0);

    const previousActiveProducts = products.filter(product =>
      product.stock > 0 &&
      product.added_at >= oneMonthAgo - (30 * 24 * 60 * 60 * 1000) &&
      product.added_at < oneMonthAgo
    ).length;

    // Calcular porcentajes de cambio
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    };

    const trends = {
      revenue: calculatePercentageChange(currentRevenue, previousRevenue) + " from last month",
      orders: calculatePercentageChange(currentPaidOrders.length, previousPaidOrders.length) + " from last month",
      clocks: calculatePercentageChange(currentClocksSold, previousClocksSold) + " from last month",
      products: calculatePercentageChange(currentActiveProducts, previousActiveProducts) + " from last month"
    };

    console.log(`📈 [getTrends] Tendencias calculadas:`, {
      current: {
        revenue: currentRevenue,
        orders: currentPaidOrders.length,
        clocks: currentClocksSold,
        products: currentActiveProducts
      },
      previous: {
        revenue: previousRevenue,
        orders: previousPaidOrders.length,
        clocks: previousClocksSold,
        products: previousActiveProducts
      },
      trends
    });

    return trends;
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
      // Basic product info
      name: v.union(v.string(), v.null()),
      description: v.union(v.string(), v.null()),
      handle: v.union(v.string(), v.null()),
      seo_title: v.union(v.string(), v.null()),
      seo_description: v.union(v.string(), v.null()),
      published: v.union(v.boolean(), v.null()),
      free_shipping: v.union(v.boolean(), v.null()),
      video_url: v.union(v.string(), v.null()),
      tags: v.union(v.string(), v.null()),
      brand: v.union(v.string(), v.null()),
      // Variant info (from first variant)
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
        await ctx.db.delete(product._id);
        deletedCount++;
      } catch (error) {
        console.error(`❌ [Delete All Products] Error eliminando producto ${product._id}:`, error);
      }
    }

    console.log(`✅ [Delete All Products] ${deletedCount} productos eliminados`);
    return { success: true, deletedCount };
  },
});

// Función para registrar logs de webhooks
export const logWebhook = mutation({
  args: {
    idempotencyKey: v.string(),
    storeId: v.number(),
    event: v.string(),
    productId: v.union(v.number(), v.null()),
    payload: v.string(),
    processedAt: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`📝 [Log Webhook] Registrando webhook: ${args.event} para store ${args.storeId}`);

    await ctx.db.insert("webhook_logs", {
      ...args,
      createdAt: Date.now(),
    });

    console.log(`✅ [Log Webhook] Webhook registrado exitosamente`);
    return { success: true };
  },
});

// Función para obtener logs de webhooks
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

// Función para actualizar producto desde webhook
export const updateProductFromWebhook = mutation({
  args: {
    productId: v.number(),
    updates: v.object({
      name: v.union(v.string(), v.null()),
      description: v.union(v.string(), v.null()),
      handle: v.union(v.string(), v.null()),
      seo_title: v.union(v.string(), v.null()),
      seo_description: v.union(v.string(), v.null()),
      published: v.union(v.boolean(), v.null()),
      free_shipping: v.union(v.boolean(), v.null()),
      video_url: v.union(v.string(), v.null()),
      tags: v.union(v.string(), v.null()),
      brand: v.union(v.string(), v.null()),
      price: v.union(v.number(), v.null()),
      promotional_price: v.union(v.number(), v.null()),
      stock: v.number(),
      weight: v.union(v.number(), v.null()),
      tiendanube_sku: v.union(v.string(), v.null()),
      cost: v.union(v.number(), v.null()),
      updated_at: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Update Product From Webhook] Actualizando producto ${args.productId}`);

    // Buscar el producto en tiendanube_products
    const existingProduct = await ctx.db
      .query("tiendanube_products")
      .filter((q) => q.eq(q.field("tiendanube_id"), args.productId))
      .first();

    if (existingProduct) {
      await ctx.db.patch(existingProduct._id, args.updates);
      console.log(`✅ [Update Product From Webhook] Producto actualizado exitosamente`);
      return { success: true, action: "updated" };
    } else {
      console.log(`⚠️ [Update Product From Webhook] Producto ${args.productId} no encontrado`);
      return { success: false, action: "not_found" };
    }
  },
});

// Función para obtener logs de webhooks recientes para el dashboard
export const getRecentWebhookLogs = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const skip = args.skip || 0;

    const logs = await ctx.db
      .query("webhook_logs")
      .order("desc")
      .collect();

    const paginatedLogs = logs.slice(skip, skip + limit);
    const hasMore = logs.length > skip + limit;

    return {
      logs: paginatedLogs.map(log => ({
        id: log._id,
        event: log.event,
        storeId: log.storeId,
        productId: log.productId,
        status: log.status,
        processedAt: log.processedAt,
        createdAt: log.createdAt,
      })),
      hasMore,
    };
  },
});

// Función para obtener imágenes de un producto específico
export const getProductImages = query({
  args: {
    productId: v.number(),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("tiendanube_product_images")
      .filter((q) => q.eq(q.field("product_id"), args.productId))
      .order("asc")
      .collect();

    return images;
  },
});

// Función para obtener todos los productos con datos transformados para el UI
export const getProductsWithProviderData = query({
  args: {},
  handler: async (ctx) => {
    const tiendanubeProducts = await ctx.db.query("tiendanube_products").collect();

    // Transformar los datos al formato requerido por el UI
    const productsWithDetails = await Promise.all(tiendanubeProducts.map(async (product) => {
      // Fetch images for this product
      const productImages = await ctx.db
        .query("tiendanube_product_images")
        .filter((q) => q.eq(q.field("product_id"), product.tiendanube_id))
        .order("asc")
        .collect();

      // Extract image URLs
      const imageUrls = productImages.map(img => img.src);

      // Calcular precio promocional si existe
      const hasPromotionalPrice = product.promotional_price !== null && product.promotional_price > 0;
      const displayPrice = hasPromotionalPrice ? product.promotional_price! : (product.price || 0);
      const compareAtPrice = hasPromotionalPrice ? product.price : null;

      // Determinar estado del stock
      const lowStockThreshold = 5; // Valor por defecto
      let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
      if (product.stock === 0) {
        stockStatus = "out_of_stock";
      } else if (product.stock <= lowStockThreshold) {
        stockStatus = "low_stock";
      }

      // Determinar estado del producto
      let status: "active" | "inactive" | "discontinued" = "active";
      if (product.stock === 0) {
        status = "inactive";
      }

      // Calcular margen de ganancia
      const costPrice = product.cost || 0;
      const profitMargin = displayPrice > 0 ? ((displayPrice - costPrice) / displayPrice) * 100 : 0;

      return {
        id: product._id,
        provider: "tiendanube" as const,
        providerProductId: product.tiendanube_id.toString(),
        sku: product.tiendanube_sku || `TF-${product.tiendanube_id}`,
        name: product.name || `Product ${product.tiendanube_id}`,
        description: product.description || `Product description for ${product.tiendanube_id}`,
        category: "Clocks", // Default category
        subcategory: "Wall Clocks", // Default subcategory
        price: displayPrice,
        compareAtPrice: compareAtPrice,
        costPrice: costPrice,
        stockQuantity: product.stock,
        lowStockThreshold: lowStockThreshold,
        status: status,
        images: imageUrls.length > 0 ? imageUrls : ["/placeholder.svg"], // Use actual images or fallback to placeholder
        weight: product.weight || 999,
        dimensions: {
          length: 999,
          width: 999,
          height: 999,
        },
        materials: ["mocked"], // Placeholder materials
        features: ["mocked"], // Placeholder features
        warranty: "mocked", // Placeholder warranty
        brand: product.brand || "Timeflies",
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        tags: product.tags ? product.tags.split(',').map(tag => tag.trim()) : ["mocked"],
        profitMargin: profitMargin,
        stockStatus: stockStatus,
        // Additional detailed fields
        handle: product.handle || null,
        seo_title: product.seo_title || null,
        seo_description: product.seo_description || null,
        published: product.published || null,
        free_shipping: product.free_shipping || null,
        video_url: product.video_url || null,
      };
    }));

    return productsWithDetails;
  },
});

// Query to get product sales stats (number of orders per product)
export const getProductSalesStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("tiendanube_orders").collect();
    // Only consider paid orders
    const paidOrders = orders.filter(order => order.payment_status === "paid");
    const orderCountByProduct: Record<string, number> = {};

    for (const order of paidOrders) {
      try {
        const productsData = JSON.parse(order.products);
        // Use a Set to avoid double-counting a product in the same order
        const productIdsInOrder = new Set<string>();
        for (const product of productsData) {
          const productId = product.id || product.product_id;
          if (!productId) continue;
          productIdsInOrder.add(productId.toString());
        }
        for (const productId of productIdsInOrder) {
          orderCountByProduct[productId] = (orderCountByProduct[productId] || 0) + 1;
        }
      } catch (error) {
        // Ignore orders with invalid product data
        continue;
      }
    }
    return orderCountByProduct;
  },
});

// Función para obtener IDs internos para logs de webhooks
export const getWebhookLogsWithInternalIds = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const skip = args.skip || 0;

    const logs = await ctx.db
      .query("webhook_logs")
      .order("desc")
      .collect();

    const paginatedLogs = logs.slice(skip, skip + limit);
    const hasMore = logs.length > skip + limit;

    // Enriquecer logs con IDs internos
    const enrichedLogs = await Promise.all(paginatedLogs.map(async (log) => {
      let internalId = null;
      let internalType = null;

      if (log.productId) {
        // Buscar producto por tiendanube_id
        const product = await ctx.db
          .query("tiendanube_products")
          .filter((q) => q.eq(q.field("tiendanube_id"), log.productId))
          .first();

        if (product) {
          internalId = product._id;
          internalType = "product";
        }
      } else if (log.event.startsWith("order/") || log.event.startsWith("fulfillment/")) {
        // Para eventos de órdenes, necesitamos extraer el order ID del payload
        try {
          const payload = JSON.parse(log.payload);
          const orderId = payload.id || payload.order_id;

          if (orderId) {
            const order = await ctx.db
              .query("tiendanube_orders")
              .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", orderId))
              .first();

            if (order) {
              internalId = order._id;
              internalType = "order";
            }
          }
        } catch (error) {
          console.error("Error parsing webhook payload:", error);
        }
      }

      return {
        id: log._id,
        event: log.event,
        storeId: log.storeId,
        productId: log.productId,
        status: log.status,
        processedAt: log.processedAt,
        createdAt: log.createdAt,
        internalId,
        internalType,
      };
    }));

    return {
      logs: enrichedLogs,
      hasMore,
    };
  },
});
