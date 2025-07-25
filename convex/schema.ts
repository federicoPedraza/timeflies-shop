import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  "tiendanube_user_credentials": defineTable({
    user_id: v.string(),
    access_token: v.string(), // Encrypted access token
    business_id: v.union(v.string(), v.null()),
    store_info: v.union(v.string(), v.null()), // JSON string of store info
    has_seen_onboarding: v.optional(v.boolean()), // Track if user has seen onboarding
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_user_id", ["user_id"]),
  "tiendanube_products": defineTable({
    tiendanube_id: v.number(),
    tiendanube_product_id: v.number(),
    // Basic product info - made optional for existing data compatibility
    name: v.optional(v.union(v.string(), v.null())),
    description: v.optional(v.union(v.string(), v.null())),
    handle: v.optional(v.union(v.string(), v.null())),
    seo_title: v.optional(v.union(v.string(), v.null())),
    seo_description: v.optional(v.union(v.string(), v.null())),
    published: v.optional(v.union(v.boolean(), v.null())),
    free_shipping: v.optional(v.union(v.boolean(), v.null())),
    video_url: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.union(v.string(), v.null())),
    brand: v.optional(v.union(v.string(), v.null())),
    // Variant info (from first variant)
    price: v.union(v.number(), v.null()),
    promotional_price: v.union(v.number(), v.null()),
    stock: v.number(),
    weight: v.union(v.number(), v.null()),
    tiendanube_sku: v.union(v.string(), v.null()),
    cost: v.union(v.number(), v.null()),
    // Timestamps
    created_at: v.string(),
    updated_at: v.string(),
    added_at: v.number(),
    store_id: v.number(),
  }),
  "tiendanube_product_images": defineTable({
    tiendanube_id: v.number(),
    product_id: v.number(),
    src: v.string(),
    position: v.number(),
    alt: v.union(v.string(), v.null()),
    created_at: v.string(),
    updated_at: v.string(),
    added_at: v.number(),
  }).index("by_product_id", ["product_id"]),
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
  "tiendanube_checkouts": defineTable({
    tiendanube_id: v.union(v.number(), v.float64()),
    store_id: v.union(v.number(), v.float64()),
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
    shipping_min_days: v.optional(v.number()),
    shipping_max_days: v.optional(v.number()),
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
    shipping_cost_owner: v.optional(v.string()),
    shipping_cost_customer: v.optional(v.string()),
    coupon: v.string(), // JSON string
    promotional_discount: v.string(), // JSON string
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
    shipping: v.optional(v.string()),
    shipping_option: v.optional(v.string()),
    shipping_option_code: v.optional(v.string()),
    shipping_option_reference: v.optional(v.union(v.string(), v.null())),
    shipping_pickup_details: v.union(v.string(), v.null()), // JSON string or null
    shipping_tracking_number: v.optional(v.union(v.string(), v.null())),
    shipping_tracking_url: v.optional(v.union(v.string(), v.null())),
    shipping_store_branch_name: v.optional(v.union(v.string(), v.null())),
    shipping_pickup_type: v.optional(v.string()),
    shipping_suboption: v.optional(v.string()), // JSON string
    extra: v.string(), // JSON string
    storefront: v.string(),
    note: v.union(v.string(), v.null()),
    created_at: v.string(),
    updated_at: v.string(),
    completed_at: v.union(v.string(), v.null()),
    next_action: v.optional(v.string()),
    payment_details: v.string(), // JSON string
    attributes: v.string(), // JSON string
    products: v.string(), // JSON string
    added_at: v.number(),
    dismissed: v.optional(v.boolean()), // New field for dismissed checkouts
  }).index("by_tiendanube_id", ["tiendanube_id"]),
  "user_logs": defineTable({
    user_id: v.string(),
    action: v.string(),
    details: v.string(), // JSON string with additional details
    timestamp: v.number(),
    resource_type: v.optional(v.string()), // e.g., "checkout", "order", "product"
    resource_id: v.optional(v.string()), // ID of the affected resource
  }).index("by_user_id", ["user_id"]).index("by_timestamp", ["timestamp"]),
});
