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

// Función para obtener estadísticas de órdenes para el dashboard
export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("tiendanube_orders").collect();

    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.payment_status === "paid").length;
    const pendingOrders = orders.filter(order => order.status === "open").length;
    const cancelledOrders = orders.filter(order => order.status === "cancelled").length;

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      unpaidOrders: orders.filter(order => order.payment_status === "pending").length,
    };
  },
});

// Función para obtener estadísticas detalladas de revenue
export const getRevenueStats = query({
  args: {},
  handler: async (ctx) => {
    // Obtener todos los productos y órdenes
    const products = await ctx.db.query("tiendanube_products").collect();
    const orders = await ctx.db.query("tiendanube_orders").collect();

    // Debug: Verificar productos con costos
    const productsWithCost = products.filter(p => p.cost !== null);
    console.log(`💰 [getRevenueStats] Total productos: ${products.length}`);
    console.log(`💰 [getRevenueStats] Productos con costo: ${productsWithCost.length}`);
    if (productsWithCost.length > 0) {
      console.log(`💰 [getRevenueStats] Ejemplos de costos:`, productsWithCost.slice(0, 3).map(p => ({
        id: p.tiendanube_id,
        cost: p.cost,
        price: p.price
      })));
    }

    // Filtrar solo órdenes pagadas
    const paidOrders = orders.filter(order => order.payment_status === "paid");
    console.log(`💰 [getRevenueStats] Órdenes pagadas: ${paidOrders.length} de ${orders.length}`);

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalClocksSold = 0;
    let revenueByProduct: Record<string, { revenue: number; cost: number; profit: number; quantity: number }> = {};

    for (const order of paidOrders) {
      try {
        const productsData = JSON.parse(order.products);
        let orderRevenue = 0;
        let orderCost = 0;
        let orderProfit = 0;
        let orderClocksSold = 0;

        for (const product of productsData) {
          const productId = product.id || product.product_id;
          const quantity = product.quantity || 1;
          const price = parseFloat(product.price || "0"); // NO convertir de centavos

          // Buscar el producto en la base de datos
          const dbProduct = products.find(p => p.tiendanube_id === parseInt(productId));

          let cost = 0;
          let isEstimatedCost = false;

          if (dbProduct && dbProduct.cost) {
            // Usar costo real si existe - NO convertir de centavos
            cost = dbProduct.cost;
          } else {
            // Usar costo estimado (60% del precio de venta) si no hay costo real
            cost = price * 0.6; // 60% del precio como costo estimado
            isEstimatedCost = true;
            console.log(`⚠️ [getRevenueStats] Usando costo estimado para producto ${productId}: precio=${price}, costo estimado=${cost}`);
          }

          const revenue = price * quantity; // Revenue es el precio de venta
          const productCost = cost * quantity;
          const profit = revenue - productCost;

          orderRevenue += revenue;
          orderCost += productCost;
          orderProfit += profit;
          orderClocksSold += quantity;

          // Agrupar por producto
          const productKey = dbProduct?.tiendanube_sku || productId.toString();
          if (!revenueByProduct[productKey]) {
            revenueByProduct[productKey] = { revenue: 0, cost: 0, profit: 0, quantity: 0 };
          }
          revenueByProduct[productKey].revenue += revenue;
          revenueByProduct[productKey].cost += productCost;
          revenueByProduct[productKey].profit += profit;
          revenueByProduct[productKey].quantity += quantity;
        }

        // Verificar si el revenue calculado coincide con el total de la orden
        const orderTotal = parseFloat(order.total || "0");
        if (Math.abs(orderRevenue - orderTotal) > 1) { // Tolerancia de 1 unidad
          console.log(`⚠️ [getRevenueStats] Revenue calculado (${orderRevenue}) no coincide con total de orden (${orderTotal}) para orden ${order.tiendanube_id}`);
          // Usar el total de la orden como revenue y recalcular profit
          orderRevenue = orderTotal;
          orderProfit = orderRevenue - orderCost;
        }

        totalRevenue += orderRevenue;
        totalCost += orderCost;
        totalProfit += orderProfit;
        totalClocksSold += orderClocksSold;

      } catch (error) {
        console.error(`❌ [getRevenueStats] Error procesando orden ${order.tiendanube_id}:`, error);
        // Si hay error al parsear, usar el total de la orden
        const orderTotal = parseFloat(order.total || "0"); // NO convertir de centavos
        totalRevenue += orderTotal;
        // No podemos calcular cost/profit para esta orden, solo revenue
      }
    }

    // Calcular métricas adicionales
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    const result = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      totalClocksSold,
      totalPaidOrders: paidOrders.length,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      revenueByProduct,
    };

    console.log(`💰 [getRevenueStats] Resultado final:`, {
      totalRevenue: result.totalRevenue,
      totalCost: result.totalCost,
      totalProfit: result.totalProfit,
      profitMargin: result.profitMargin,
      totalPaidOrders: result.totalPaidOrders,
      averageOrderValue: result.averageOrderValue,
      totalClocksSold: result.totalClocksSold,
    });

    return result;
  },
});

// Función para obtener estadísticas de revenue potencial (todas las órdenes no canceladas)
export const getPotentialRevenueStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("tiendanube_orders").collect();

    // Filtrar órdenes no canceladas (todas excepto las canceladas)
    const nonCancelledOrders = orders.filter(order => order.status !== "cancelled");

    // Filtrar órdenes pagadas para calcular revenue actual
    const paidOrders = orders.filter(order => order.payment_status === "paid");

    let potentialRevenue = 0;
    let currentRevenue = 0;

    // Calcular revenue potencial (todas las órdenes no canceladas)
    for (const order of nonCancelledOrders) {
      try {
        const orderTotal = parseFloat(order.total || "0"); // NO convertir de centavos
        potentialRevenue += orderTotal;
      } catch (error) {
        console.error(`❌ [getPotentialRevenueStats] Error procesando orden ${order.tiendanube_id}:`, error);
      }
    }

    // Calcular revenue actual (solo órdenes pagadas)
    for (const order of paidOrders) {
      try {
        const orderTotal = parseFloat(order.total || "0"); // NO convertir de centavos
        currentRevenue += orderTotal;
      } catch (error) {
        console.error(`❌ [getPotentialRevenueStats] Error procesando orden pagada ${order.tiendanube_id}:`, error);
      }
    }

    // Calcular porcentaje de revenue faltante
    const missingRevenuePercentage = potentialRevenue > 0
      ? ((potentialRevenue - currentRevenue) / potentialRevenue) * 100
      : 0;

    const result = {
      potentialRevenue: Math.round(potentialRevenue * 100) / 100,
      currentRevenue: Math.round(currentRevenue * 100) / 100,
      missingRevenue: Math.round((potentialRevenue - currentRevenue) * 100) / 100,
      missingRevenuePercentage: Math.round(missingRevenuePercentage * 100) / 100,
      totalNonCancelledOrders: nonCancelledOrders.length,
      totalPaidOrders: paidOrders.length,
    };

    console.log(`💰 [getPotentialRevenueStats] Resultado final:`, {
      potentialRevenue: result.potentialRevenue,
      currentRevenue: result.currentRevenue,
      missingRevenue: result.missingRevenue,
      missingRevenuePercentage: result.missingRevenuePercentage,
      totalNonCancelledOrders: result.totalNonCancelledOrders,
      totalPaidOrders: result.totalPaidOrders,
    });

    return result;
  },
});

// Función para obtener todas las órdenes con datos transformados para el UI
export const getOrdersWithProviderData = query({
  args: {},
  handler: async (ctx) => {
    const tiendanubeOrders = await ctx.db.query("tiendanube_orders").collect();

    // Transformar los datos al formato requerido por el UI
    const ordersWithDetails = tiendanubeOrders.map((order) => {
      // Parsear los productos
      let products = [];
      try {
        const productsData = JSON.parse(order.products);
        products = productsData.map((product: any) => ({
          id: product.id?.toString() || product.product_id?.toString() || Math.random().toString(),
          name: product.name || "Product without name",
          category: product.category || "No category",
          price: parseFloat(product.price || "0"), // NO convertir de centavos
          quantity: product.quantity || 1,
          image: product.image?.src || "/placeholder.svg",
        }));
      } catch (error) {
        console.error("Error parsing products for order", order.tiendanube_id, error);
        products = [];
      }

      // Parsear la dirección de envío
      let shippingAddress = {
        street: "Address not available",
        number: "",
        floor: "",
        apartment: "",
        neighborhood: "",
        city: "City not available",
        state: "State not available",
        zipCode: "Zip code not available",
        country: "Country not available",
      };

      try {
        const shippingData = JSON.parse(order.shipping_address);
        if (shippingData) {
          shippingAddress = {
            street: shippingData.address || shippingData.street || "Address not available",
            number: shippingData.number || "",
            floor: shippingData.floor || "",
            apartment: shippingData.apartment || "",
            neighborhood: shippingData.locality || shippingData.neighborhood || "",
            city: shippingData.city || "City not available",
            state: shippingData.province || shippingData.state || "State not available",
            zipCode: shippingData.zipcode || shippingData.zip || "Zip code not available",
            country: shippingData.country || "Country not available",
          };
        }
      } catch (error) {
        console.error("Error parsing shipping address for order", order.tiendanube_id, error);
      }

      // Parsear datos del cliente para obtener el ID
      let customerId = null;
      try {
        const customerData = JSON.parse(order.customer);
        if (customerData && customerData.id) {
          customerId = customerData.id.toString();
        }
      } catch (error) {
        console.error("Error parsing customer data for order", order.tiendanube_id, error);
      }

      // Calcular totales
      const subtotal = parseFloat(order.subtotal || "0"); // NO convertir de centavos
      const total = parseFloat(order.total || "0"); // NO convertir de centavos
      const discount = parseFloat(order.discount || "0"); // NO convertir de centavos
      let shippingCost = 0;
      let shippingInfo = null;

      // Parsear información de envío
      if (order.previous_total_shipping_cost) {
        try {
          const shippingData = JSON.parse(order.previous_total_shipping_cost);
          if (shippingData && typeof shippingData === 'object') {
            shippingCost = (shippingData.consumer_cost || 0); // NO convertir de centavos
            shippingInfo = {
              consumer_cost: (shippingData.consumer_cost || 0), // NO convertir de centavos
              merchant_cost: (shippingData.merchant_cost || 0), // NO convertir de centavos
            };
          }
        } catch (error) {
          console.error("Error parsing shipping cost for order", order.tiendanube_id, error);
        }
      }

      const taxAmount = total - subtotal - shippingCost + discount;

      // Mapear estados
      const orderStatusMap: { [key: string]: string } = {
        "open": "pending",
        "closed": "delivered",
        "cancelled": "cancelled",
        "payment_pending": "pending",
        "payment_confirmed": "confirmed",
        "payment_authorized": "processing",
        "payment_in_process": "processing",
        "payment_rejected": "failed",
        "payment_refunded": "refunded",
        "payment_pending_confirmation": "pending",
        "payment_on_hold": "pending",
        "fulfilled": "shipped",
        "unfulfilled": "pending",
      };

      const paymentStatusMap: { [key: string]: string } = {
        "pending": "pending",
        "paid": "paid",
        "authorized": "paid",
        "in_process": "processing",
        "rejected": "failed",
        "refunded": "refunded",
        "cancelled": "cancelled",
        "in_mediation": "pending",
        "pending_confirmation": "pending",
        "on_hold": "pending",
      };

      const paymentMethodMap: { [key: string]: string } = {
        "mercadopago": "credit_card",
        "paypal": "paypal",
        "bank_transfer": "bank_transfer",
        "cash_on_delivery": "cash_on_delivery",
        "credit_card": "credit_card",
        "debit_card": "credit_card",
      };

      const shippingStatusMap: { [key: string]: string } = {
        "pending": "unshipped",
        "unpacked": "unpacked",
        "unfulfilled": "unshipped",
        "packed": "shipped",
        "ready_to_ship": "shipped",
        "shipped": "shipped",
        "in_transit": "shipped",
        "out_for_delivery": "unpacked",
        "delivered": "delivered",
        "fulfilled": "delivered",
      };

      return {
        id: order._id,
        provider: "tiendanube" as const,
        providerOrderId: order.tiendanube_id.toString(),
        orderNumber: `TF-${order.tiendanube_id}`,
        customer: {
          name: order.contact_name || "Customer without name",
          email: order.contact_email || "Email not available",
          phone: order.contact_phone || "Phone not available",
          id: customerId,
        },
        products,
        orderStatus: orderStatusMap[order.status] || "pending" as any,
        paymentStatus: paymentStatusMap[order.payment_status] || "pending" as any,
        paymentMethod: paymentMethodMap[order.gateway] || "credit_card" as any,
        shippingStatus: shippingStatusMap[order.shipping_status] || "unshipped" as any,
        totalAmount: total,
        shippingCost,
        taxAmount: Math.max(0, taxAmount),
        discountAmount: discount,
        orderDate: order.created_at,
        shippingAddress,
        shippingInfo,
        notes: ((order.note ?? order.owner_note) || undefined) as string | undefined,
      };
    });

    return ordersWithDetails;
  },
});

// Función para obtener datos de revenue diario de los últimos 30 días
export const getDailyRevenueData = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const orders = await ctx.db.query("tiendanube_orders").collect();

    // Filtrar solo órdenes pagadas
    const paidOrders = orders.filter(order => order.payment_status === "paid");

    // Crear un mapa para agrupar revenue por fecha
    const revenueByDate: Record<string, number> = {};

    // Inicializar todos los días con 0
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      revenueByDate[dateString] = 0;
    }

    // Calcular revenue por día
    for (const order of paidOrders) {
      try {
        const orderDate = new Date(order.created_at);
        const dateString = orderDate.toISOString().split('T')[0];

        // Solo incluir si está dentro del rango de días solicitado
        const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < days) {
          const orderTotal = parseFloat(order.total || "0"); // NO convertir de centavos
          revenueByDate[dateString] = (revenueByDate[dateString] || 0) + orderTotal;
        }
      } catch (error) {
        console.error(`❌ [getDailyRevenueData] Error procesando orden ${order.tiendanube_id}:`, error);
      }
    }

    // Convertir a array de objetos con fecha y revenue
    const dailyRevenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100, // Redondear a 2 decimales
    }));

    // Ordenar por fecha
    dailyRevenueData.sort((a, b) => a.date.localeCompare(b.date));

    return dailyRevenueData;
  },
});

// Función para obtener datos de revenue potencial diario (todas las órdenes no canceladas)
export const getDailyPotentialRevenueData = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const orders = await ctx.db.query("tiendanube_orders").collect();

    // Filtrar órdenes no canceladas (todas excepto las canceladas)
    const nonCancelledOrders = orders.filter(order => order.status !== "cancelled");

    // Crear un mapa para agrupar revenue potencial por fecha
    const potentialRevenueByDate: Record<string, number> = {};

    // Inicializar todos los días con 0
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      potentialRevenueByDate[dateString] = 0;
    }

    // Calcular revenue potencial por día
    for (const order of nonCancelledOrders) {
      try {
        const orderDate = new Date(order.created_at);
        const dateString = orderDate.toISOString().split('T')[0];

        // Solo incluir si está dentro del rango de días solicitado
        const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < days) {
          const orderTotal = parseFloat(order.total || "0"); // NO convertir de centavos
          potentialRevenueByDate[dateString] = (potentialRevenueByDate[dateString] || 0) + orderTotal;
        }
      } catch (error) {
        console.error(`❌ [getDailyPotentialRevenueData] Error procesando orden ${order.tiendanube_id}:`, error);
      }
    }

    // Convertir a array de objetos con fecha y revenue potencial
    const dailyPotentialRevenueData = Object.entries(potentialRevenueByDate).map(([date, potentialRevenue]) => ({
      date,
      potentialRevenue: Math.round(potentialRevenue * 100) / 100, // Redondear a 2 decimales
    }));

    // Ordenar por fecha
    dailyPotentialRevenueData.sort((a, b) => a.date.localeCompare(b.date));

    return dailyPotentialRevenueData;
  },
});
