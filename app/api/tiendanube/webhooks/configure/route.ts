import { NextRequest, NextResponse } from 'next/server';

interface WebhookEvent {
  event: string;
  url: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀 [Tiendanube Webhooks Configure] Endpoint called');

  try {
    const { webhookUrl } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL format' },
        { status: 400 }
      );
    }

    // Get configuration from environment
    const accessToken = process.env.TIENDANUBE_ACCESS_TOKEN;
    const userId = process.env.TIENDANUBE_USER_ID;
    const userAgent = process.env.TIENDANUBE_USER_AGENT;

    if (!accessToken || !userId || !userAgent) {
      console.log('❌ [Tiendanube Webhooks Configure] Missing environment variables');
      return NextResponse.json(
        { error: 'Tiendanube configuration not found' },
        { status: 500 }
      );
    }

    // Define all webhook events to register
    const webhookEvents: WebhookEvent[] = [
      // Categories
      { event: 'category/created', url: webhookUrl },
      { event: 'category/updated', url: webhookUrl },
      { event: 'category/deleted', url: webhookUrl },

      // App events
      { event: 'app/uninstalled', url: webhookUrl },
      { event: 'app/suspended', url: webhookUrl },
      { event: 'app/resumed', url: webhookUrl },

      // Order events
      { event: 'order/created', url: webhookUrl },
      { event: 'order/updated', url: webhookUrl },
      { event: 'order/paid', url: webhookUrl },
      { event: 'order/packed', url: webhookUrl },
      { event: 'order/fulfilled', url: webhookUrl },
      { event: 'order/cancelled', url: webhookUrl },
      { event: 'order/custom_fields_updated', url: webhookUrl },
      { event: 'order/edited', url: webhookUrl },
      { event: 'order/pending', url: webhookUrl },
      { event: 'order/voided', url: webhookUrl },

      // Product events
      { event: 'product/created', url: webhookUrl },
      { event: 'product/updated', url: webhookUrl },
      { event: 'product/deleted', url: webhookUrl },

      // Product variant events
      { event: 'product_variant/custom_fields_updated', url: webhookUrl },

      // Domain events
      { event: 'domain/updated', url: webhookUrl },

      // Order custom field events
      { event: 'order_custom_field/created', url: webhookUrl },
      { event: 'order_custom_field/updated', url: webhookUrl },
      { event: 'order_custom_field/deleted', url: webhookUrl },

      // Product variant custom field events
      { event: 'product_variant_custom_field/created', url: webhookUrl },
      { event: 'product_variant_custom_field/updated', url: webhookUrl },
      { event: 'product_variant_custom_field/deleted', url: webhookUrl },

      // Subscription and fulfillment events
      { event: 'subscription/updated', url: webhookUrl },
      { event: 'fulfillment/updated', url: webhookUrl },
    ];

    const baseUrl = `https://api.tiendanube.com/2025-03/${userId}/webhooks`;
    const headers = {
      'Authentication': `bearer ${accessToken}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json; charset=utf-8',
    };

    console.log(`📤 [Tiendanube Webhooks Configure] Registering ${webhookEvents.length} webhook events`);
    console.log(`🌐 [Tiendanube Webhooks Configure] Base URL: ${baseUrl}`);
    console.log(`🔗 [Tiendanube Webhooks Configure] Webhook URL: ${webhookUrl}`);

    const results = {
      total: webhookEvents.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Register each webhook event
    for (const webhookEvent of webhookEvents) {
      try {
        console.log(`📤 [Tiendanube Webhooks Configure] Registering: ${webhookEvent.event}`);

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookEvent),
        });

        if (response.ok) {
          results.successful++;
          console.log(`✅ [Tiendanube Webhooks Configure] Successfully registered: ${webhookEvent.event}`);
        } else {
          const errorText = await response.text();
          const errorMessage = `Failed to register ${webhookEvent.event}: ${response.status} ${response.statusText}`;
          results.errors.push(errorMessage);
          results.failed++;
          console.log(`❌ [Tiendanube Webhooks Configure] ${errorMessage}`);
          console.log(`❌ [Tiendanube Webhooks Configure] Error response: ${errorText}`);
        }
      } catch (error) {
        const errorMessage = `Error registering ${webhookEvent.event}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMessage);
        results.failed++;
        console.log(`💥 [Tiendanube Webhooks Configure] ${errorMessage}`);
      }
    }

    console.log(`📊 [Tiendanube Webhooks Configure] Results:`, results);

    return NextResponse.json({
      success: results.failed === 0,
      message: `Webhook configuration completed. ${results.successful} successful, ${results.failed} failed.`,
      results,
      webhookUrl,
    });

  } catch (error) {
    console.error('💥 [Tiendanube Webhooks Configure] Unexpected error:', error);
    console.error('💥 [Tiendanube Webhooks Configure] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to configure webhooks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
