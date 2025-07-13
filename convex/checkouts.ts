import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    checkoutData: v.object({
      id: v.number(),
      store_id: v.number(),
      token: v.string(),
      abandoned_checkout_url: v.string(),
      contact_email: v.string(),
      contact_name: v.string(),
      contact_phone: v.union(v.string(), v.null()),
      contact_identification: v.union(v.string(), v.null()),
      shipping_name: v.string(),
      shipping_phone: v.union(v.string(), v.null()),
      shipping_address: v.string(),
      shipping_number: v.string(),
      shipping_floor: v.union(v.string(), v.null()),
      shipping_locality: v.string(),
      shipping_zipcode: v.string(),
      shipping_city: v.string(),
      shipping_province: v.string(),
      shipping_country: v.string(),
      shipping_min_days: v.number(),
      shipping_max_days: v.number(),
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
      shipping_cost_owner: v.string(),
      shipping_cost_customer: v.string(),
      coupon: v.any(),
      promotional_discount: v.any(),
      subtotal: v.string(),
      discount: v.string(),
      discount_coupon: v.string(),
      discount_gateway: v.string(),
      total: v.string(),
      total_usd: v.string(),
      checkout_enabled: v.boolean(),
      weight: v.string(),
      currency: v.string(),
      language: v.string(),
      gateway: v.union(v.string(), v.null()),
      gateway_id: v.union(v.string(), v.null()),
      shipping: v.string(),
      shipping_option: v.string(),
      shipping_option_code: v.string(),
      shipping_option_reference: v.union(v.string(), v.null()),
      shipping_pickup_details: v.any(),
      shipping_tracking_number: v.union(v.string(), v.null()),
      shipping_tracking_url: v.union(v.string(), v.null()),
      shipping_store_branch_name: v.union(v.string(), v.null()),
      shipping_pickup_type: v.string(),
      shipping_suboption: v.any(),
      extra: v.any(),
      storefront: v.string(),
      note: v.union(v.string(), v.null()),
      created_at: v.string(),
      updated_at: v.string(),
      completed_at: v.any(),
      next_action: v.string(),
      payment_details: v.any(),
      attributes: v.any(),
      products: v.any(),
    }),
  },
  handler: async (ctx, args) => {
    const { checkoutData } = args;

    // Verificar si el checkout ya existe
    const existingCheckout = await ctx.db
      .query("tiendanube_checkouts")
      .withIndex("by_tiendanube_id", (q) => q.eq("tiendanube_id", checkoutData.id))
      .first();

    const checkoutDataToInsert = {
      tiendanube_id: checkoutData.id,
      store_id: checkoutData.store_id,
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
      shipping_min_days: checkoutData.shipping_min_days,
      shipping_max_days: checkoutData.shipping_max_days,
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
      shipping_cost_owner: checkoutData.shipping_cost_owner,
      shipping_cost_customer: checkoutData.shipping_cost_customer,
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
      shipping: checkoutData.shipping,
      shipping_option: checkoutData.shipping_option,
      shipping_option_code: checkoutData.shipping_option_code,
      shipping_option_reference: checkoutData.shipping_option_reference,
      shipping_pickup_details: checkoutData.shipping_pickup_details ? JSON.stringify(checkoutData.shipping_pickup_details) : null,
      shipping_tracking_number: checkoutData.shipping_tracking_number,
      shipping_tracking_url: checkoutData.shipping_tracking_url,
      shipping_store_branch_name: checkoutData.shipping_store_branch_name,
      shipping_pickup_type: checkoutData.shipping_pickup_type,
      shipping_suboption: JSON.stringify(checkoutData.shipping_suboption),
      extra: JSON.stringify(checkoutData.extra),
      storefront: checkoutData.storefront,
      note: checkoutData.note,
      created_at: checkoutData.created_at,
      updated_at: checkoutData.updated_at,
      completed_at: checkoutData.completed_at ? JSON.stringify(checkoutData.completed_at) : null,
      next_action: checkoutData.next_action,
      payment_details: JSON.stringify(checkoutData.payment_details),
      attributes: JSON.stringify(checkoutData.attributes),
      products: JSON.stringify(checkoutData.products),
      added_at: Date.now(),
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
