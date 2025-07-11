import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  "tiendanube_products": defineTable({
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
    store_id: v.number(),
  }),
  "tiendanube_orders": defineTable({
    tiendanube_id: v.number(),
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
    extra: v.string(), // JSON string
    storefront: v.string(),
    note: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    completed_at: v.union(v.string(), v.null()), // JSON string or null
    payment_details: v.string(), // JSON string
    same_billing_and_shipping_address: v.boolean(),
    attributes: v.string(), // JSON string
    customer: v.string(), // JSON string
    products: v.string(), // JSON string
    number: v.number(),
    cancel_reason: v.union(v.string(), v.null()),
    owner_note: v.union(v.string(), v.null()),
    cancelled_at: v.union(v.string(), v.null()),
    closed_at: v.union(v.string(), v.null()),
    read_at: v.union(v.string(), v.null()),
    status: v.string(),
    payment_status: v.string(),
    gateway_link: v.union(v.string(), v.null()),
    shipping_address: v.string(), // JSON string
    shipping_status: v.string(),
    fulfillments: v.string(), // JSON string
    paid_at: v.union(v.string(), v.null()),
    client_details: v.string(), // JSON string
    app_id: v.union(v.string(), v.null()),
    coupon: v.string(), // JSON string
    free_shipping_config: v.union(v.string(), v.null()), // JSON string or null
    has_shippable_products: v.boolean(),
    order_origin: v.union(v.string(), v.null()),
    payment_count: v.number(),
    previous_shipping_costs: v.union(v.string(), v.null()), // JSON string or null
    previous_total_shipping_cost: v.union(v.string(), v.null()), // JSON string or null
    promotional_discount: v.union(v.string(), v.null()), // JSON string or null
    total_paid_by_customer: v.union(v.string(), v.null()),
    customer_visit: v.string(), // JSON string
    added_at: v.number(),
  }).index("by_tiendanube_id", ["tiendanube_id"]),
  "webhook_logs": defineTable({
    idempotencyKey: v.string(),
    storeId: v.number(),
    event: v.string(),
    productId: v.union(v.number(), v.null()),
    payload: v.string(),
    processedAt: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }),
});
