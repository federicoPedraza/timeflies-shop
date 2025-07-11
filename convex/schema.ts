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
  "products": defineTable({
    sku: v.string(),
    provider: v.literal("tiendanube"),
    item_id: v.number(),
  }),
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
