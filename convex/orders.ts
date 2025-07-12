import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Función para obtener una orden de TiendaNube por ID
export const getTiendanubeOrder = query({
  args: { orderId: v.number() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("tiendanube_orders")
      .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", args.orderId))
      .first();

    if (!order) {
      throw new Error(`Orden no encontrada: ${args.orderId}`);
    }

    return order;
  },
});

// Función para crear o actualizar una orden de TiendaNube
export const upsertTiendanubeOrder = mutation({
  args: {
    orderData: v.object({
      id: v.number(),
      store_id: v.number(),
      token: v.string(),
      contact_email: v.string(),
      contact_name: v.string(),
      contact_phone: v.union(v.string(), v.null()),
      contact_identification: v.union(v.string(), v.null()),
      billing_name: v.string(),
      billing_phone: v.union(v.string(), v.null()),
      billing_address: v.string(),
      billing_number: v.string(),
      billing_floor: v.union(v.string(), v.null()),
      billing_locality: v.string(),
      billing_zipcode: v.string(),
      billing_city: v.string(),
      billing_province: v.string(),
      billing_country: v.string(),
      billing_customer_type: v.union(v.string(), v.null()),
      billing_business_activity: v.union(v.string(), v.null()),
      billing_business_name: v.union(v.string(), v.null()),
      billing_trade_name: v.union(v.string(), v.null()),
      billing_state_registration: v.union(v.string(), v.null()),
      billing_fiscal_regime: v.union(v.string(), v.null()),
      billing_invoice_use: v.union(v.string(), v.null()),
      billing_document_type: v.union(v.string(), v.null()),
      subtotal: v.string(),
      discount: v.string(),
      discount_coupon: v.union(v.string(), v.null()),
      discount_gateway: v.string(),
      total: v.string(),
      total_usd: v.string(),
      checkout_enabled: v.boolean(),
      weight: v.string(),
      currency: v.string(),
      language: v.string(),
      gateway: v.string(),
      gateway_id: v.union(v.string(), v.null()),
      gateway_name: v.string(),
      extra: v.any(),
      storefront: v.string(),
      note: v.string(),
      created_at: v.string(),
      updated_at: v.string(),
      completed_at: v.any(),
      payment_details: v.any(),
      same_billing_and_shipping_address: v.boolean(),
      attributes: v.any(),
      customer: v.any(),
      products: v.any(),
      number: v.number(),
      cancel_reason: v.union(v.string(), v.null()),
      owner_note: v.union(v.string(), v.null()),
      cancelled_at: v.any(),
      closed_at: v.any(),
      read_at: v.any(),
      status: v.string(),
      payment_status: v.string(),
      gateway_link: v.union(v.string(), v.null()),
      shipping_address: v.any(),
      shipping_status: v.string(),
      fulfillments: v.any(),
      paid_at: v.any(),
      client_details: v.any(),
      app_id: v.union(v.string(), v.null()),
      coupon: v.any(),
      free_shipping_config: v.any(),
      has_shippable_products: v.boolean(),
      order_origin: v.union(v.string(), v.null()),
      payment_count: v.number(),
      previous_shipping_costs: v.any(),
      previous_total_shipping_cost: v.any(),
      promotional_discount: v.any(),
      total_paid_by_customer: v.union(v.string(), v.null()),
      customer_visit: v.any(),
    }),
  },
  handler: async (ctx, args) => {
    const { orderData } = args;

    // Verificar si la orden ya existe
    const existingOrder = await ctx.db
      .query("tiendanube_orders")
      .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", orderData.id))
      .first();

    const orderDataToInsert = {
      tiendanube_id: orderData.id,
      store_id: orderData.store_id,
      token: orderData.token,
      contact_email: orderData.contact_email,
      contact_name: orderData.contact_name,
      contact_phone: orderData.contact_phone,
      contact_identification: orderData.contact_identification,
      billing_name: orderData.billing_name,
      billing_phone: orderData.billing_phone,
      billing_address: orderData.billing_address,
      billing_number: orderData.billing_number,
      billing_floor: orderData.billing_floor,
      billing_locality: orderData.billing_locality,
      billing_zipcode: orderData.billing_zipcode,
      billing_city: orderData.billing_city,
      billing_province: orderData.billing_province,
      billing_country: orderData.billing_country,
      billing_customer_type: orderData.billing_customer_type,
      billing_business_activity: orderData.billing_business_activity,
      billing_business_name: orderData.billing_business_name,
      billing_trade_name: orderData.billing_trade_name,
      billing_state_registration: orderData.billing_state_registration,
      billing_fiscal_regime: orderData.billing_fiscal_regime,
      billing_invoice_use: orderData.billing_invoice_use,
      billing_document_type: orderData.billing_document_type,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      discount_coupon: orderData.discount_coupon,
      discount_gateway: orderData.discount_gateway,
      total: orderData.total,
      total_usd: orderData.total_usd,
      checkout_enabled: orderData.checkout_enabled,
      weight: orderData.weight,
      currency: orderData.currency,
      language: orderData.language,
      gateway: orderData.gateway,
      gateway_id: orderData.gateway_id,
      gateway_name: orderData.gateway_name,
      extra: JSON.stringify(orderData.extra),
      storefront: orderData.storefront,
      note: orderData.note,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      completed_at: orderData.completed_at ? JSON.stringify(orderData.completed_at) : null,
      payment_details: JSON.stringify(orderData.payment_details),
      same_billing_and_shipping_address: orderData.same_billing_and_shipping_address,
      attributes: JSON.stringify(orderData.attributes),
      customer: JSON.stringify(orderData.customer),
      products: JSON.stringify(orderData.products),
      number: orderData.number,
      cancel_reason: orderData.cancel_reason,
      owner_note: orderData.owner_note,
      cancelled_at: orderData.cancelled_at ? JSON.stringify(orderData.cancelled_at) : null,
      closed_at: orderData.closed_at ? JSON.stringify(orderData.closed_at) : null,
      read_at: orderData.read_at ? JSON.stringify(orderData.read_at) : null,
      status: orderData.status,
      payment_status: orderData.payment_status,
      gateway_link: orderData.gateway_link,
      shipping_address: JSON.stringify(orderData.shipping_address),
      shipping_status: orderData.shipping_status,
      fulfillments: JSON.stringify(orderData.fulfillments),
      paid_at: orderData.paid_at ? JSON.stringify(orderData.paid_at) : null,
      client_details: JSON.stringify(orderData.client_details),
      app_id: orderData.app_id,
      coupon: JSON.stringify(orderData.coupon || []),
      free_shipping_config: orderData.free_shipping_config ? JSON.stringify(orderData.free_shipping_config) : null,
      has_shippable_products: orderData.has_shippable_products || false,
      order_origin: orderData.order_origin || null,
      payment_count: orderData.payment_count || 0,
      previous_shipping_costs: orderData.previous_shipping_costs ? JSON.stringify(orderData.previous_shipping_costs) : null,
      previous_total_shipping_cost: orderData.previous_total_shipping_cost ? JSON.stringify(orderData.previous_total_shipping_cost) : null,
      promotional_discount: orderData.promotional_discount ? JSON.stringify(orderData.promotional_discount) : null,
      total_paid_by_customer: orderData.total_paid_by_customer || null,
      customer_visit: JSON.stringify(orderData.customer_visit || {}),
      added_at: Date.now(),
    };

    if (existingOrder) {
      // Actualizar orden existente
      await ctx.db.patch(existingOrder._id, orderDataToInsert);
      console.log(`✅ [Upsert Tiendanube Order] Orden actualizada: ${orderData.id}`);
      return { success: true, action: "updated", orderId: existingOrder._id };
    } else {
      // Crear nueva orden
      const orderId = await ctx.db.insert("tiendanube_orders", orderDataToInsert);
      console.log(`✅ [Upsert Tiendanube Order] Orden creada: ${orderData.id}`);
      return { success: true, action: "created", orderId };
    }
  },
});

// Función para crear una orden en nuestra tabla orders
export const createOrder = mutation({
  args: {
    provider: v.literal("tiendanube"),
    product_id: v.id("products"),
    provider_order_id: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    state: v.union(
      v.literal("unpaid"),
      v.literal("paid"),
      v.literal("pending"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", args);
    console.log(`✅ [Create Order] Orden creada: ${orderId}`);
    return { success: true, orderId };
  },
});

// Función para obtener estadísticas de órdenes para el dashboard
export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();

    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.state === "paid").length;
    const pendingOrders = orders.filter(order => order.state === "pending").length;
    const cancelledOrders = orders.filter(order => order.state === "cancelled").length;

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      unpaidOrders: orders.filter(order => order.state === "unpaid").length,
    };
  },
});

// Función para obtener una orden por producto y proveedor
export const getOrderByProductAndProvider = query({
  args: {
    productId: v.id("products"),
    providerOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) =>
        q.and(
          q.eq(q.field("product_id"), args.productId),
          q.eq(q.field("provider_order_id"), args.providerOrderId)
        )
      )
      .first();
  },
});

// Función para obtener una orden por provider_order_id
export const getOrderByProviderOrderId = query({
  args: {
    providerOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "tiendanube"),
          q.eq(q.field("provider_order_id"), args.providerOrderId)
        )
      )
      .first();
  },
});

// Función para actualizar una orden existente
export const updateOrder = mutation({
  args: {
    orderId: v.id("orders"),
    updates: v.object({
      created_at: v.string(),
      updated_at: v.string(),
      state: v.union(
        v.literal("unpaid"),
        v.literal("paid"),
        v.literal("pending"),
        v.literal("cancelled")
      ),
    }),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 [Update Order] Actualizando orden ${args.orderId}`);

    await ctx.db.patch(args.orderId, args.updates);

    console.log(`✅ [Update Order] Orden actualizada exitosamente`);
    return { success: true };
  },
});

// Función para crear o actualizar una orden (upsert)
export const upsertOrder = mutation({
  args: {
    provider: v.literal("tiendanube"),
    product_id: v.id("products"),
    provider_order_id: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    state: v.union(
      v.literal("unpaid"),
      v.literal("paid"),
      v.literal("pending"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // Buscar si la orden ya existe
    const existingOrder = await ctx.db
      .query("orders")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), args.provider),
          q.eq(q.field("provider_order_id"), args.provider_order_id)
        )
      )
      .first();

    if (existingOrder) {
      // Actualizar orden existente
      await ctx.db.patch(existingOrder._id, {
        created_at: args.created_at,
        updated_at: args.updated_at,
        state: args.state,
      });
      console.log(`✅ [Upsert Order] Orden actualizada: ${args.provider_order_id}`);
      return { success: true, action: "updated", orderId: existingOrder._id };
    } else {
      // Crear nueva orden
      const orderId = await ctx.db.insert("orders", args);
      console.log(`✅ [Upsert Order] Orden creada: ${args.provider_order_id}`);
      return { success: true, action: "created", orderId };
    }
  },
});

// Función para obtener todas las órdenes
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();

    // Obtener datos completos de TiendaNube para cada orden
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          const tiendanubeOrder = await ctx.db
            .query("tiendanube_orders")
            .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", parseInt(order.provider_order_id)))
            .first();

          return {
            ...order,
            tiendanube_details: tiendanubeOrder ? {
              contact_name: tiendanubeOrder.contact_name,
              contact_email: tiendanubeOrder.contact_email,
              total: tiendanubeOrder.total,
              currency: tiendanubeOrder.currency,
              status: tiendanubeOrder.status,
              payment_status: tiendanubeOrder.payment_status,
              created_at: tiendanubeOrder.created_at,
            } : null,
          };
        } catch (error) {
          console.error(`Error obteniendo detalles de orden ${order.provider_order_id}:`, error);
          return order;
        }
      })
    );

    return ordersWithDetails;
  },
});

// Función para limpiar duplicados de órdenes
export const cleanupDuplicateOrders = mutation({
  args: {},
  handler: async (ctx) => {
    console.log(`🧹 [Cleanup Duplicate Orders] Iniciando limpieza de duplicados`);

    const results = {
      total_orders: 0,
      duplicates_removed: 0,
      errors: 0,
      errors_details: [] as string[]
    };

    try {
      // Obtener todas las órdenes
      const allOrders = await ctx.db.query("orders").collect();
      results.total_orders = allOrders.length;

      // Agrupar por provider_order_id
      const ordersByProviderId = new Map<string, any[]>();

      for (const order of allOrders) {
        const key = order.provider_order_id;
        if (!ordersByProviderId.has(key)) {
          ordersByProviderId.set(key, []);
        }
        ordersByProviderId.get(key)!.push(order);
      }

      // Eliminar duplicados, manteniendo solo la más reciente
      for (const [providerOrderId, orders] of ordersByProviderId) {
        if (orders.length > 1) {
          console.log(`🔄 [Cleanup Duplicate Orders] Encontrados ${orders.length} duplicados para ${providerOrderId}`);

          // Ordenar por updated_at (más reciente primero)
          orders.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

          // Mantener la primera (más reciente) y eliminar el resto
          const toDelete = orders.slice(1);

          for (const duplicate of toDelete) {
            try {
              await ctx.db.delete(duplicate._id);
              results.duplicates_removed++;
              console.log(`🗑️ [Cleanup Duplicate Orders] Eliminado duplicado: ${duplicate._id}`);
            } catch (error) {
              console.error(`❌ [Cleanup Duplicate Orders] Error eliminando duplicado ${duplicate._id}:`, error);
              results.errors++;
              results.errors_details.push(`Error eliminando ${duplicate._id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        }
      }

      console.log(`✅ [Cleanup Duplicate Orders] Limpieza completada:`, results);
      return results;
    } catch (error) {
      console.error(`❌ [Cleanup Duplicate Orders] Error general:`, error);
      throw error;
    }
  },
});

// Función para refrescar órdenes locales basándose en tiendanube_orders
export const refreshLocalOrders = mutation({
  args: {},
  handler: async (ctx) => {
    console.log(`🔄 [Refresh Local Orders] Iniciando refresco de órdenes locales`);

    const results = {
      total_processed: 0,
      updated: 0,
      created: 0,
      errors: 0,
      errors_details: [] as string[]
    };

    try {
      // Obtener todas las órdenes de TiendaNube
      const tiendanubeOrders = await ctx.db.query("tiendanube_orders").collect();
      console.log(`📊 [Refresh Local Orders] Procesando ${tiendanubeOrders.length} órdenes de TiendaNube`);

      for (const tiendanubeOrder of tiendanubeOrders) {
        try {
          // Parsear los productos de la orden
          const productsData = JSON.parse(tiendanubeOrder.products);

          if (!Array.isArray(productsData)) {
            console.warn(`⚠️ [Refresh Local Orders] Productos no válidos para orden ${tiendanubeOrder.tiendanube_id}`);
            continue;
          }

          // Procesar cada producto de la orden
          for (const product of productsData) {
            try {
              // Buscar el producto en nuestra tabla products
              const timefliesProduct = await ctx.db
                .query("products")
                .withIndex("by_provider_item_id", (q) =>
                  q.eq("provider", "tiendanube").eq("item_id", product.product_id)
                )
                .first();

              if (timefliesProduct) {
                // Determinar el estado basado en payment_status y status
                let state: "unpaid" | "paid" | "pending" | "cancelled" = "pending";

                if (tiendanubeOrder.payment_status === "paid") {
                  state = "paid";
                } else if (tiendanubeOrder.payment_status === "pending") {
                  state = "pending";
                } else if (tiendanubeOrder.status === "cancelled" || tiendanubeOrder.cancelled_at) {
                  state = "cancelled";
                } else {
                  state = "unpaid";
                }

                // Verificar si ya existe esta orden para evitar duplicados
                const existingOrder = await ctx.db
                  .query("orders")
                  .filter((q) =>
                    q.and(
                      q.eq(q.field("provider"), "tiendanube"),
                      q.eq(q.field("provider_order_id"), tiendanubeOrder.tiendanube_id.toString())
                    )
                  )
                  .first();

                if (!existingOrder) {
                  // Crear nueva orden solo si no existe
                  await ctx.db.insert("orders", {
                    provider: "tiendanube",
                    product_id: timefliesProduct._id,
                    provider_order_id: tiendanubeOrder.tiendanube_id.toString(),
                    created_at: tiendanubeOrder.created_at,
                    updated_at: tiendanubeOrder.updated_at,
                    state: state,
                  });
                  results.created++;
                } else {
                  // Actualizar orden existente
                  await ctx.db.patch(existingOrder._id, {
                    created_at: tiendanubeOrder.created_at,
                    updated_at: tiendanubeOrder.updated_at,
                    state: state,
                  });
                  results.updated++;
                }

                results.total_processed++;
                console.log(`✅ [Refresh Local Orders] Orden procesada: ${tiendanubeOrder.tiendanube_id} para producto ${product.product_id}`);
              } else {
                console.warn(`⚠️ [Refresh Local Orders] Producto ${product.product_id} no encontrado en tabla products`);
              }
            } catch (error) {
              console.error(`❌ [Refresh Local Orders] Error procesando producto ${product.product_id}:`, error);
              results.errors++;
              results.errors_details.push(`Producto ${product.product_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        } catch (error) {
          console.error(`❌ [Refresh Local Orders] Error procesando orden ${tiendanubeOrder.tiendanube_id}:`, error);
          results.errors++;
          results.errors_details.push(`Orden ${tiendanubeOrder.tiendanube_id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      console.log(`✅ [Refresh Local Orders] Refresco completado:`, results);
      return results;
    } catch (error) {
      console.error(`❌ [Refresh Local Orders] Error general:`, error);
      throw error;
    }
  },
});
