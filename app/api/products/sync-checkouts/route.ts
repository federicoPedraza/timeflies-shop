import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

    // Get access token and store ID from environment variables
    const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
    const storeId = process.env.TIENDANUBE_USER_ID;

    if (!accessToken || !storeId) {
      console.error('❌ [Sync Checkouts] TIENDANUBE_ACCESS_TOKEN or TIENDANUBE_USER_ID not configured');
      return NextResponse.json(
        { error: 'TiendaNube credentials not configured' },
        { status: 500 }
      );
    }

    console.log(`📦 [Sync Checkouts] Syncing checkouts for store ${storeId}`);

        let allCheckouts: any[] = [];
    let page = 1;
    const perPage = 50;
    let hasMore = true;

    console.log('🔄 [Sync Checkouts] Fetching checkouts from Tiendanube...');

    // Fetch all checkouts with pagination
    while (hasMore) {
      try {
        const response = await fetch(
          `https://api.tiendanube.com/2025-03/${storeId}/checkouts?page=${page}&per_page=${perPage}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': `bearer ${accessToken}`,
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
