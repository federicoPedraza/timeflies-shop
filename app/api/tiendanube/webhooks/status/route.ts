import { NextRequest, NextResponse } from 'next/server';
import { getUserCredentials } from '../../../../../lib/tiendanube-auth';

interface TiendanubeWebhook {
  id: number;
  event: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  console.log('🚀 [Tiendanube Webhooks Status] Endpoint called');

  try {
    // Get user ID from request headers (set by frontend)
    const userId = request.headers.get('x-tiendanube-user-id');
    console.log('👤 [Tiendanube Webhooks Status] User ID from header:', userId);

    if (!userId) {
      console.log('❌ [Tiendanube Webhooks Status] No user ID provided in header');
      return NextResponse.json(
        { error: 'User ID required in x-tiendanube-user-id header' },
        { status: 400 }
      );
    }

    // Get user credentials from Convex
    const credentials = await getUserCredentials(userId);
    if (!credentials) {
      console.log('❌ [Tiendanube Webhooks Status] No credentials found for user:', userId);
      return NextResponse.json(
        { error: 'User credentials not found. Please re-authenticate.' },
        { status: 401 }
      );
    }

    const userAgent = process.env.TIENDANUBE_USER_AGENT;
    console.log('⚙️ [Tiendanube Webhooks Status] Environment variables:');
    console.log('   - TIENDANUBE_USER_AGENT:', userAgent ? 'Present' : 'Missing');

    if (!userAgent) {
      console.log('❌ [Tiendanube Webhooks Status] Missing user agent from .env');
      return NextResponse.json(
        { error: 'TIENDANUBE_USER_AGENT not configured in .env' },
        { status: 500 }
      );
    }

    const webhooksUrl = `https://api.tiendanube.com/2025-03/${userId}/webhooks`;
    const headers = {
      'Authentication': `bearer ${credentials.access_token}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json; charset=utf-8',
    };

    console.log(`🌐 [Tiendanube Webhooks Status] Making request to: ${webhooksUrl}`);

    const response = await fetch(webhooksUrl, {
      method: 'GET',
      headers,
    });

    console.log('📥 [Tiendanube Webhooks Status] Response status:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.log('❌ [Tiendanube Webhooks Status] Error response body:', responseText);

      if (response.status === 401 || response.status === 403) {
        console.log('🔐 [Tiendanube Webhooks Status] Authentication/Authorization error');
        return NextResponse.json(
          {
            status: false,
            error: 'Invalid or expired access token'
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          status: false,
          error: `Tiandanube API error: ${response.status}`
        },
        { status: 200 }
      );
    }

    const webhooks: TiendanubeWebhook[] = await response.json();
    console.log(`✅ [Tiendanube Webhooks Status] Found ${webhooks.length} webhooks`);

    // Group webhooks by event type for better organization
    const webhooksByType = webhooks.reduce((acc, webhook) => {
      const eventType = webhook.event.split('/')[0];
      if (!acc[eventType]) {
        acc[eventType] = [];
      }
      acc[eventType].push(webhook);
      return acc;
    }, {} as Record<string, TiendanubeWebhook[]>);

    const response_data = {
      status: true,
      total_webhooks: webhooks.length,
      webhooks,
      webhooks_by_type: webhooksByType,
      summary: {
        product_events: webhooksByType.product?.length || 0,
        order_events: webhooksByType.order?.length || 0,
        app_events: webhooksByType.app?.length || 0,
        category_events: webhooksByType.category?.length || 0,
        other_events: Object.keys(webhooksByType).filter(type =>
          !['product', 'order', 'app', 'category'].includes(type)
        ).reduce((sum, type) => sum + (webhooksByType[type]?.length || 0), 0)
      }
    };

    console.log('🎯 [Tiendanube Webhooks Status] Returning success response:', {
      total_webhooks: response_data.total_webhooks,
      summary: response_data.summary
    });

    return NextResponse.json(response_data);

  } catch (error) {
    console.error('💥 [Tiendanube Webhooks Status] Unexpected error:', error);
    console.error('💥 [Tiendanube Webhooks Status] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        status: false,
        error: 'Failed to check webhook status'
      },
      { status: 200 }
    );
  }
}
