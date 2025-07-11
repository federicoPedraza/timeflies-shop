import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    system: {
      name: "TimeFlies Webhook System",
      version: "2.0.0",
      description: "Sistema de webhooks para Tiendanube con verificación HMAC, idempotencia y cumplimiento LGPD"
    },
    endpoint: {
      url: "/api/webhooks/tiendanube",
      method: "POST",
      status: "active"
    },
    features: {
      hmac_verification: {
        enabled: true,
        algorithm: "HMAC-SHA256",
        header: "x-linkedstore-hmac-sha256",
        method: "Raw body verification with crypto.timingSafeEqual",
        description: "Verificación de autenticidad de webhooks usando body raw"
      },
      idempotency: {
        enabled: true,
        method: "Unique key generation",
        format: "${store_id}-${event}-${id}",
        description: "Prevención de procesamiento duplicado"
      },
            lgpd_compliance: {
        enabled: true,
        webhooks: [
          "store/redact",
          "customers/redact",
          "customers/data_request"
        ],
        description: "Cumplimiento con leyes de protección de datos (elimina todos los productos)"
      },
      product_sync: {
        enabled: true,
        events: [
          "product/created",
          "product/updated",
          "product/deleted"
        ],
        description: "Sincronización automática de productos"
      },
      logging: {
        enabled: true,
        level: "detailed",
        includes: [
          "Request ID",
          "Headers",
          "Payload",
          "Processing time",
          "Errors"
        ],
        description: "Logging completo para auditoría"
      }
    },
    security: {
      verification: "HMAC-SHA256 signature verification with raw body",
      timing_safe: "crypto.timingSafeEqual() to prevent timing attacks",
      validation: "Required fields validation",
      sanitization: "Input data sanitization",
      timeout: "10 seconds (Tiendanube standard)"
    },
    retry_policy: {
      timeout: "10 seconds",
      initial_retries: "Immediate, 5min, 10min, 15min",
      exponential_backoff: "×1.4 multiplier",
      max_attempts: 18,
      max_duration: "48 hours"
    },
        environment_variables: {
      required: [
        "TIENDANUBE_APP_ID",
        "TIENDANUBE_APP_SECRET",
        "NEXT_PUBLIC_CONVEX_URL"
      ],
      optional: [],
      note: "TIENDANUBE_ACCESS_TOKEN is stored in frontend localStorage as 'tiendanube_access_token'"
    },
    database_tables: {
      tiendanube_products: "Almacena datos de productos sincronizados",
      products: "Tabla principal de productos con SKUs únicos",
      webhook_logs: "Registro de webhooks para idempotencia"
    },
    api_endpoints: {
      webhook: {
        url: "/api/webhooks/tiendanube",
        method: "POST",
        description: "Endpoint principal para recibir webhooks"
      },
      logs: {
        url: "/api/webhooks/tiendanube/logs",
        method: "GET",
        description: "Información sobre logs del sistema"
      },
      info: {
        url: "/api/webhooks/tiendanube/info",
        method: "GET",
        description: "Esta página - información del sistema"
      }
    },
    documentation: {
      setup: "/docs/webhooks-setup.md",
      tiendanube_api: "https://tiendanube.github.io/api-documentation/resources/webhook",
      lgpd_info: "Webhooks requeridos para cumplimiento LGPD"
    },
    status: {
      timestamp: new Date().toISOString(),
      uptime: "active",
      last_webhook: "N/A",
      total_processed: "N/A"
    }
  });
}
