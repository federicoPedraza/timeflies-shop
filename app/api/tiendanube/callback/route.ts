import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { encrypt } from '../../../../lib/encryption';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const response = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.TIENDANUBE_APP_ID,
        client_secret: process.env.TIENDANUBE_APP_SECRET,
        grant_type: 'authorization_code',
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: 400 });
    }

    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.log('❌ [Tiendanube Callback] NEXT_PUBLIC_CONVEX_URL not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_CONVEX_URL not configured' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(convexUrl);

    // Convert user_id to string (TiendaNube returns it as a number)
    const userId = String(data.user_id);
    console.log(`👤 [Tiendanube Callback] User ID: ${userId} (converted from ${data.user_id})`);

    // Encrypt the access token
    const encryptedAccessToken = encrypt(data.access_token);

    // Store encrypted credentials in Convex
    await convex.mutation(api.auth.upsertUserCredentials, {
      user_id: userId,
      access_token: encryptedAccessToken,
      business_id: null, // Will be updated when store info is fetched
      store_info: null, // Will be updated when store info is fetched
    });

    console.log(`✅ [Tiendanube Callback] Credentials stored for user: ${userId}`);

    return NextResponse.json({
      access_token: data.access_token, // Still return for immediate use
      user_id: userId,
      message: 'Access token obtained and stored successfully.',
      env_variables: {
        TIENDANUBE_ACCESS_TOKEN: data.access_token,
        TIENDANUBE_USER_ID: userId,
      },
      stored: true,
    });

  } catch (error) {
    console.error('❌ [Tiendanube Callback] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process authorization' },
      { status: 500 }
    );
  }
}
