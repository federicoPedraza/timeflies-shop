import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createUserLog } from "./auth";
import { api } from "./_generated/api";

// Función para obtener un checkout de Tiendanube por ID
export const getTiendanubeCheckout = query({
  args: { checkoutId: v.number() },
  handler: async (ctx, args) => {
    const checkout = await ctx.db
      .query("tiendanube_checkouts")
      .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", args.checkoutId))
      .first();

    if (!checkout) {
      throw new Error(`Checkout no encontrado: ${args.checkoutId}`);
    }

    return checkout;
  },
});

// Función para crear o actualizar un checkout de Tiendanube
export const upsertTiendanubeCheckout = mutation({
  args: {
    checkoutData: v.any(),
  },
  handler: async (ctx, args) => {
    const { checkoutData } = args;

    // Verificar si el checkout ya existe
    const existingCheckout = await ctx.db
      .query("tiendanube_checkouts")
      .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", checkoutData.id))
      .first();

    const checkoutDataToInsert = {
      tiendanube_id: Number(checkoutData.id),
      store_id: Number(checkoutData.store_id),
      token: checkoutData.token,
      abandoned_checkout_url: checkoutData.abandoned_checkout_url,
      contact_email: checkoutData.contact_email,
      contact_name: checkoutData.contact_name,
      contact_phone: checkoutData.contact_phone,
      contact_identification: checkoutData.contact_identification,
      shipping_name: checkoutData.shipping_name,
      shipping_phone: checkoutData.shipping_phone,
      shipping_address: checkoutData.shipping_address,
      shipping_number: checkoutData.shipping_number,
      shipping_floor: checkoutData.shipping_floor,
      shipping_locality: checkoutData.shipping_locality,
      shipping_zipcode: checkoutData.shipping_zipcode,
      shipping_city: checkoutData.shipping_city,
      shipping_province: checkoutData.shipping_province,
      shipping_country: checkoutData.shipping_country,
      shipping_min_days: checkoutData.shipping_min_days || 0,
      shipping_max_days: checkoutData.shipping_max_days || 0,
      billing_name: checkoutData.billing_name,
      billing_phone: checkoutData.billing_phone,
      billing_address: checkoutData.billing_address,
      billing_number: checkoutData.billing_number,
      billing_floor: checkoutData.billing_floor,
      billing_locality: checkoutData.billing_locality,
      billing_zipcode: checkoutData.billing_zipcode,
      billing_city: checkoutData.billing_city,
      billing_province: checkoutData.billing_province,
      billing_country: checkoutData.billing_country,
      shipping_cost_owner: checkoutData.shipping_cost_owner || "0.00",
      shipping_cost_customer: checkoutData.shipping_cost_customer || "0.00",
      coupon: JSON.stringify(checkoutData.coupon),
      promotional_discount: JSON.stringify(checkoutData.promotional_discount),
      subtotal: checkoutData.subtotal,
      discount: checkoutData.discount,
      discount_coupon: checkoutData.discount_coupon,
      discount_gateway: checkoutData.discount_gateway,
      total: checkoutData.total,
      total_usd: checkoutData.total_usd,
      checkout_enabled: checkoutData.checkout_enabled,
      weight: checkoutData.weight,
      currency: checkoutData.currency,
      language: checkoutData.language,
      gateway: checkoutData.gateway,
      gateway_id: checkoutData.gateway_id,
      shipping: checkoutData.shipping || "",
      shipping_option: checkoutData.shipping_option || "",
      shipping_option_code: checkoutData.shipping_option_code || "",
      shipping_option_reference: checkoutData.shipping_option_reference || null,
      shipping_pickup_details: checkoutData.shipping_pickup_details ? JSON.stringify(checkoutData.shipping_pickup_details) : null,
      shipping_tracking_number: checkoutData.shipping_tracking_number || null,
      shipping_tracking_url: checkoutData.shipping_tracking_url || null,
      shipping_store_branch_name: checkoutData.shipping_store_branch_name || null,
      shipping_pickup_type: checkoutData.shipping_pickup_type || "",
      shipping_suboption: checkoutData.shipping_suboption ? JSON.stringify(checkoutData.shipping_suboption) : "{}",
      extra: JSON.stringify(checkoutData.extra),
      storefront: checkoutData.storefront,
      note: checkoutData.note,
      created_at: checkoutData.created_at,
      updated_at: checkoutData.updated_at,
      completed_at: checkoutData.completed_at ? JSON.stringify(checkoutData.completed_at) : null,
      next_action: checkoutData.next_action || "",
      payment_details: JSON.stringify(checkoutData.payment_details),
      attributes: JSON.stringify(checkoutData.attributes),
      products: JSON.stringify(checkoutData.products),
      added_at: Date.now(),
      // Set dismissed to false by default for new checkouts
      dismissed: existingCheckout ? existingCheckout.dismissed : false,
    };

    if (existingCheckout) {
      // Actualizar checkout existente
      await ctx.db.patch(existingCheckout._id, checkoutDataToInsert);
      console.log(`✅ [Upsert Tiendanube Checkout] Checkout actualizado: ${checkoutData.id}`);
      return { success: true, action: "updated", checkoutId: existingCheckout._id };
    } else {
      // Crear nuevo checkout
      const checkoutId = await ctx.db.insert("tiendanube_checkouts", checkoutDataToInsert);
      console.log(`✅ [Upsert Tiendanube Checkout] Checkout creado: ${checkoutData.id}`);
      return { success: true, action: "created", checkoutId };
    }
  },
});

// Función para obtener todos los checkouts con datos transformados para el UI
export const getCheckoutsWithProviderData = query({
  args: {},
  handler: async (ctx) => {
    const tiendanubeCheckouts = await ctx.db.query("tiendanube_checkouts").collect();

    // Transformar los datos al formato requerido por el UI
    const checkoutsWithDetails = tiendanubeCheckouts.map((checkout) => {
      // Parsear los productos
      let products = [];
      try {
        const productsData = JSON.parse(checkout.products);
        products = productsData.map((product: any) => ({
          id: product.id?.toString() || product.product_id?.toString() || Math.random().toString(),
          name: product.name || "Product without name",
          category: product.category || "No category",
          price: parseFloat(product.price || "0"), // NO convertir de centavos
          quantity: product.quantity || 1,
          image: product.image?.src || "/placeholder.svg",
        }));
      } catch (error) {
        console.error("Error parsing products for checkout", checkout.tiendanube_id, error);
        products = [];
      }

      // Calcular totales
      const subtotal = parseFloat(checkout.subtotal || "0"); // NO convertir de centavos
      const total = parseFloat(checkout.total || "0"); // NO convertir de centavos
      const discount = parseFloat(checkout.discount || "0"); // NO convertir de centavos
      const shippingCost = parseFloat(checkout.shipping_cost_customer || "0"); // NO convertir de centavos

      return {
        id: checkout.tiendanube_id.toString(),
        token: checkout.token,
        abandoned_checkout_url: checkout.abandoned_checkout_url,
        contact: {
          email: checkout.contact_email,
          name: checkout.contact_name,
          phone: checkout.contact_phone,
          identification: checkout.contact_identification,
        },
        shipping: {
          name: checkout.shipping_name,
          phone: checkout.shipping_phone,
          address: checkout.shipping_address,
          number: checkout.shipping_number,
          floor: checkout.shipping_floor,
          locality: checkout.shipping_locality,
          zipcode: checkout.shipping_zipcode,
          city: checkout.shipping_city,
          province: checkout.shipping_province,
          country: checkout.shipping_country,
          min_days: checkout.shipping_min_days,
          max_days: checkout.shipping_max_days,
          cost: shippingCost,
        },
        billing: {
          name: checkout.billing_name,
          phone: checkout.billing_phone,
          address: checkout.billing_address,
          number: checkout.billing_number,
          floor: checkout.billing_floor,
          locality: checkout.billing_locality,
          zipcode: checkout.billing_zipcode,
          city: checkout.billing_city,
          province: checkout.billing_province,
          country: checkout.billing_country,
        },
        financial: {
          subtotal,
          total,
          discount,
          currency: checkout.currency,
          language: checkout.language,
        },
        products,
        status: {
          checkout_enabled: checkout.checkout_enabled,
          completed_at: checkout.completed_at,
          next_action: checkout.next_action,
        },
        timestamps: {
          created_at: checkout.created_at,
          updated_at: checkout.updated_at,
        },
      };
    });

    return checkoutsWithDetails;
  },
});

// Función para obtener estadísticas de checkouts para el dashboard
export const getCheckoutStats = query({
  args: {},
  handler: async (ctx) => {
    const checkouts = await ctx.db.query("tiendanube_checkouts").collect();

    const totalCheckouts = checkouts.length;
    const completedCheckouts = checkouts.filter(checkout => checkout.completed_at !== null).length;
    const abandonedCheckouts = checkouts.filter(checkout => checkout.completed_at === null).length;

    // Calcular valor total de checkouts abandonados
    let totalAbandonedValue = 0;
    const abandonedCheckoutsList = checkouts.filter(checkout => checkout.completed_at === null);
    for (const checkout of abandonedCheckoutsList) {
      try {
        const total = parseFloat(checkout.total || "0");
        totalAbandonedValue += total;
      } catch (error) {
        console.error(`Error parsing total for checkout ${checkout.tiendanube_id}:`, error);
      }
    }

    return {
      totalCheckouts,
      completedCheckouts,
      abandonedCheckouts,
      totalAbandonedValue: Math.round(totalAbandonedValue * 100) / 100,
    };
  },
});

// Mutation to dismiss all abandoned checkouts
export const dismissAllAbandonedCheckouts = mutation({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    // Get all abandoned checkouts (completed_at === null, dismissed !== true)
    const abandoned = await ctx.db
      .query("tiendanube_checkouts")
      .filter((q) => q.and(q.eq(q.field("completed_at"), null), q.or(q.eq(q.field("dismissed"), false), q.eq(q.field("dismissed"), undefined))))
      .collect();

    let count = 0;
    for (const checkout of abandoned) {
      await ctx.db.patch(checkout._id, { dismissed: true });
      count++;
    }

    // Log the action
    await ctx.runMutation(api.auth.createUserLog, {
      user_id: args.user_id,
      action: "dismiss_all_abandoned_checkouts",
      details: JSON.stringify({ count, date: new Date().toISOString() }),
      resource_type: "checkout",
      resource_id: undefined,
    });

    return { success: true, count };
  },
});

// Query to get count of not-dismissed abandoned checkouts and last dismiss log
export const getAbandonedCheckoutsInfo = query({
  args: {},
  handler: async (ctx) => {
    // Count not-dismissed abandoned checkouts
    const checkouts = await ctx.db
      .query("tiendanube_checkouts")
      .filter((q) => q.and(q.eq(q.field("completed_at"), null), q.or(q.eq(q.field("dismissed"), false), q.eq(q.field("dismissed"), undefined))))
      .collect();
    const count = checkouts.length;

    // Get the most recent dismiss log
    const logs = await ctx.db
      .query("user_logs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", 0))
      .filter((q) => q.eq(q.field("action"), "dismiss_all_abandoned_checkouts"))
      .order("desc")
      .take(1);
    let lastDismiss = null;
    if (logs.length > 0) {
      const log = logs[0];
      let details: any = {};
      try {
        details = JSON.parse(log.details);
      } catch {}
      lastDismiss = {
        user_id: log.user_id,
        date: details.date,
        count: details.count,
      };
    }
    return { count, lastDismiss };
  },
});
