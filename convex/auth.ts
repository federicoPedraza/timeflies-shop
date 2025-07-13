import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store or update user credentials
export const upsertUserCredentials = mutation({
  args: {
    user_id: v.string(),
    access_token: v.string(),
    business_id: v.union(v.string(), v.null()),
    store_info: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { user_id, access_token, business_id, store_info } = args;

    // Check if credentials already exist for this user
    const existingCredentials = await ctx.db
      .query("tiendanube_user_credentials")
      .withIndex("by_user_id", (q) => q.eq("user_id", user_id))
      .first();

    const now = Date.now();

    if (existingCredentials) {
      // Update existing credentials
      await ctx.db.patch(existingCredentials._id, {
        access_token,
        business_id,
        store_info,
        updated_at: now,
      });
      console.log(`✅ [Auth] Updated credentials for user: ${user_id}`);
      return { success: true, action: "updated", id: existingCredentials._id };
    } else {
      // Create new credentials
      const id = await ctx.db.insert("tiendanube_user_credentials", {
        user_id,
        access_token,
        business_id,
        store_info,
        created_at: now,
        updated_at: now,
      });
      console.log(`✅ [Auth] Created credentials for user: ${user_id}`);
      return { success: true, action: "created", id };
    }
  },
});

// Get user credentials by user ID
export const getUserCredentials = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const credentials = await ctx.db
      .query("tiendanube_user_credentials")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .first();

    if (!credentials) {
      return null;
    }

    return {
      user_id: credentials.user_id,
      access_token: credentials.access_token,
      business_id: credentials.business_id,
      store_info: credentials.store_info,
      created_at: credentials.created_at,
      updated_at: credentials.updated_at,
    };
  },
});

// Delete user credentials
export const deleteUserCredentials = mutation({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    const credentials = await ctx.db
      .query("tiendanube_user_credentials")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .first();

    if (credentials) {
      await ctx.db.delete(credentials._id);
      console.log(`✅ [Auth] Deleted credentials for user: ${args.user_id}`);
      return { success: true };
    }

    return { success: false, error: "Credentials not found" };
  },
});

// Get all user credentials (for admin purposes)
export const getAllUserCredentials = query({
  args: {},
  handler: async (ctx) => {
    const credentials = await ctx.db.query("tiendanube_user_credentials").collect();

    return credentials.map(cred => ({
      user_id: cred.user_id,
      business_id: cred.business_id,
      created_at: cred.created_at,
      updated_at: cred.updated_at,
      // Don't return access_token for security
    }));
  },
});
