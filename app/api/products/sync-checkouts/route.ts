import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { getUserCredentials } from '@/lib/tiendanube-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [Sync Checkouts] Starting checkout synchronization...');

    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.log('❌ [Sync Checkouts] NEXT_PUBLIC_CONVEX_URL not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_CONVEX_URL not configured' },
        { status: 500 }
      );
    }
    const convex = new ConvexHttpClient(convexUrl);

    const body = await request.json();
    const { provider = 'tiendanube' } = body;

    if (provider !== 'tiendanube') {
      return NextResponse.json(
        { error: 'Only tiendanube provider is supported' },
        { status: 400 }
      );
    }

    // Get user ID from request headers (set by frontend)
    const userId = request.headers.get('x-tiendanube-user-id');
    console.log('👤 [Sync Checkouts] User ID from header:', userId);

    if (!userId) {
      console.log('❌ [Sync Checkouts] No user ID provided in header');
      return NextResponse.json(
        { error: 'User ID required in x-tiendanube-user-id header' },
        { status: 400 }
      );
    }

    // Get user credentials from Convex
    const credentials = await getUserCredentials(userId);
    if (!credentials) {
      console.log('❌ [Sync Checkouts] No credentials found for user:', userId);
      return NextResponse.json(
        { error: 'User credentials not found. Please re-authenticate.' },
        { status: 401 }
      );
    }

    console.log(`📦 [Sync Checkouts] Syncing checkouts for store ${userId}`);

    let allCheckouts: Array<{
      id: number;
      [key: string]: unknown;
    }> = [];
    let page = 1;
    const perPage = 50;
    let hasMore = true;

    console.log('🔄 [Sync Checkouts] Fetching checkouts from Tiendanube...');

    // Fetch all checkouts with pagination
    while (hasMore) {
      try {
        const response = await fetch(
          `https://api.tiendanube.com/2025-03/${userId}/checkouts?page=${page}&per_page=${perPage}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': `bearer ${credentials.access_token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`❌ [Sync Checkouts] Error fetching checkouts page ${page}: ${response.status}`);
          const errorText = await response.text();
          console.error(`📄 [Sync Checkouts] Error response: ${errorText}`);
          break;
        }

        const checkouts = await response.json();

        if (!Array.isArray(checkouts) || checkouts.length === 0) {
          hasMore = false;
          break;
        }

        allCheckouts = allCheckouts.concat(checkouts);
        console.log(`✅ [Sync Checkouts] Fetched ${checkouts.length} checkouts from page ${page}`);

        // If we got less than perPage, we've reached the end
        if (checkouts.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error(`❌ [Sync Checkouts] Error fetching checkouts page ${page}:`, error);
        break;
      }
    }

    console.log(`✅ [Sync Checkouts] Total checkouts fetched: ${allCheckouts.length}`);

    // Process each checkout
    let added = 0;
    let updated = 0;
    let errors = 0;

    for (const checkout of allCheckouts) {
      try {
        const result = await convex.mutation(api.checkouts.upsertTiendanubeCheckout, {
          checkoutData: checkout
        });

        if (result.action === 'created') {
          added++;
        } else if (result.action === 'updated') {
          updated++;
        }
      } catch (error) {
        console.error(`❌ [Sync Checkouts] Error processing checkout ${checkout.id}:`, error);
        errors++;
      }
    }

    const summary = {
      total_checkouts: allCheckouts.length,
      added,
      updated,
      errors,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ [Sync Checkouts] Synchronization completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      message: `Successfully synced ${allCheckouts.length} checkouts (${added} added, ${updated} updated, ${errors} errors)`
    });

  } catch (error) {
    console.error('❌ [Sync Checkouts] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync checkouts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
