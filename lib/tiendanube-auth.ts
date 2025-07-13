import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { decrypt } from './encryption';

export interface TiendanubeCredentials {
  access_token: string;
  business_id: string | null;
  store_info: any | null;
}

export async function getUserCredentials(userId: string): Promise<TiendanubeCredentials | null> {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error('❌ [Tiendanube Auth] NEXT_PUBLIC_CONVEX_URL not configured');
      return null;
    }

    const convex = new ConvexHttpClient(convexUrl);
    const credentials = await convex.query(api.auth.getUserCredentials, { user_id: userId });

    if (!credentials) {
      console.log(`❌ [Tiendanube Auth] No credentials found for user: ${userId}`);
      return null;
    }

    // Decrypt the access token
    const decryptedAccessToken = decrypt(credentials.access_token);

    return {
      access_token: decryptedAccessToken,
      business_id: credentials.business_id,
      store_info: credentials.store_info ? JSON.parse(credentials.store_info) : null,
    };
  } catch (error) {
    console.error(`❌ [Tiendanube Auth] Error getting credentials for user ${userId}:`, error);
    return null;
  }
}

export async function updateUserCredentials(
  userId: string,
  businessId: string | null,
  storeInfo: any | null
): Promise<boolean> {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error('❌ [Tiendanube Auth] NEXT_PUBLIC_CONVEX_URL not configured');
      return false;
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Get existing credentials to preserve the access token
    const existingCredentials = await convex.query(api.auth.getUserCredentials, { user_id: userId });

    if (!existingCredentials) {
      console.error(`❌ [Tiendanube Auth] No existing credentials found for user: ${userId}`);
      return false;
    }

    // Update with new business_id and store_info
    await convex.mutation(api.auth.upsertUserCredentials, {
      user_id: userId,
      access_token: existingCredentials.access_token, // Keep existing encrypted token
      business_id: businessId,
      store_info: storeInfo ? JSON.stringify(storeInfo) : null,
    });

    console.log(`✅ [Tiendanube Auth] Updated credentials for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ [Tiendanube Auth] Error updating credentials for user ${userId}:`, error);
    return false;
  }
}
