import { Provider, Product, ProviderConfig } from '../provider';
import { TiendanubeClient } from './client';
import { TiendanubeConfig } from './types';

export interface TiendanubeVariant {
  id: number;
  product_id: number;
  price: string;
  compare_at_price: string;
  promotional_price: string | null;
  stock_management: boolean;
  stock: number;
  weight: string;
  sku: string;
  cost: string;
  created_at: string;
  updated_at: string;
  values?: Array<{ [key: string]: string }>;
  depth?: string | null;
  height?: string | null;
  width?: string | null;
}

export interface TiendanubeProductImage {
  id: number;
  src: string;
  position: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  alt?: string;
}

export interface TiendanubeProduct {
  id: number;
  name: {
    en: string;
    es: string;
    pt: string;
  };
  description?: {
    en: string;
    es: string;
    pt: string;
  };
  handle?: {
    en: string;
    es: string;
    pt: string;
  };
  seo_title?: string | {
    en?: string;
    es?: string;
    pt?: string;
  };
  seo_description?: string | {
    en?: string;
    es?: string;
    pt?: string;
  };
  published?: boolean;
  free_shipping?: boolean;
  video_url?: string;
  tags?: string;
  brand?: string | null;
  created_at: string;
  updated_at: string;
  variants: TiendanubeVariant[];
  images?: TiendanubeProductImage[];
  attributes?: Array<{ [key: string]: string }>;
  categories?: Array<{
    id: number;
    name: { en: string; es: string; pt: string };
    description?: { en: string; es: string; pt: string };
    handle?: { en: string; es: string; pt: string };
    created_at: string;
    updated_at: string;
  }>;
}

export class TiendanubeProvider extends Provider {
  private client: TiendanubeClient;

  constructor(config: TiendanubeConfig) {
    super(config);
    this.client = new TiendanubeClient(config);
  }

  validateConfig(): boolean {
    return !!(this.config.appId && this.config.accessToken && this.config.userAgent);
  }

  getProviderName(): string {
    return 'tiendanube';
  }

  async getProducts(): Promise<Product[]> {
    if (!this.validateConfig()) {
      throw new Error('Configuración de TiendaNube inválida');
    }

    const allProducts: Product[] = [];
    let page = 1;
    const perPage = 50; // Máximo permitido por TiendaNube

    try {
      // First, get all product IDs from the listing endpoint
      const productIds: number[] = [];

      while (true) {
        const response = await this.client.getProducts({ page, per_page: perPage });
        const products = response.data as TiendanubeProduct[];

        if (!products || products.length === 0) {
          break;
        }

        // Extract product IDs
        productIds.push(...products.map(p => p.id));

        // Check if there are more pages
        const totalCount = response.headers['x-total-count'];
        if (totalCount && productIds.length >= parseInt(totalCount)) {
          break;
        }

        page++;
      }

      console.log(`📦 [TiendaNube Provider] Found ${productIds.length} products, fetching detailed information...`);

      // Now fetch detailed information for each product
      const detailedProducts: Product[] = [];
      const batchSize = 10; // Process in batches to avoid overwhelming the API

      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (productId) => {
          try {
            const detailedProduct = await this.getProduct(productId);
            if (detailedProduct) {
              return detailedProduct;
            }
          } catch (error) {
            console.error(`❌ [TiendaNube Provider] Error fetching detailed product ${productId}:`, error);
          }
          return null;
        });

        const batchResults = await Promise.all(batchPromises);
        const validProducts = batchResults.filter(p => p !== null) as Product[];
        detailedProducts.push(...validProducts);

        console.log(`📦 [TiendaNube Provider] Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productIds.length / batchSize)}: ${validProducts.length} products`);
      }

      return detailedProducts;
    } catch (error) {
      console.error('Error obteniendo productos de TiendaNube:', error);
      throw new Error(`Error obteniendo productos de TiendaNube: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getProduct(id: string | number): Promise<Product | null> {
    if (!this.validateConfig()) {
      throw new Error('Configuración de TiendaNube inválida');
    }

    try {
      const response = await this.client.getProduct(id.toString());
      const product = response.data as TiendanubeProduct;

      if (!product) {
        return null;
      }

      return this.convertToStandardProduct(product);
    } catch (error) {
      console.error(`Error obteniendo producto ${id} de TiendaNube:`, error);
      return null;
    }
  }

  async getProductImages(productId: string | number): Promise<TiendanubeProductImage[]> {
    if (!this.validateConfig()) {
      throw new Error('Configuración de TiendaNube inválida');
    }

    try {
      const response = await this.client.request<TiendanubeProductImage[]>(`/products/${productId}/images`);
      return response.data || [];
    } catch (error) {
      console.error(`Error obteniendo imágenes del producto ${productId} de TiendaNube:`, error);
      return [];
    }
  }

  private convertToStandardProduct(tiendanubeProduct: TiendanubeProduct): Product {
    // Obtener la primera variante (asumiendo que es la principal)
    const variant = tiendanubeProduct.variants?.[0];

    if (!variant) {
      console.warn(`⚠️ [TiendaNube Provider] Product ${tiendanubeProduct.id} has no variants`);
    }

    // Get the primary language name (prefer Spanish, then English, then Portuguese)
    const name = tiendanubeProduct.name.es || tiendanubeProduct.name.en || tiendanubeProduct.name.pt || 'Sin nombre';

    // Get description in the same language preference
    const description = tiendanubeProduct.description ?
      (tiendanubeProduct.description.es || tiendanubeProduct.description.en || tiendanubeProduct.description.pt) : null;

    // Get handle in the same language preference
    const handle = tiendanubeProduct.handle ?
      (tiendanubeProduct.handle.es || tiendanubeProduct.handle.en || tiendanubeProduct.handle.pt) : null;

    // Get SEO fields - they come as language objects from Tiendanube
    const seo_title = tiendanubeProduct.seo_title ?
      (typeof tiendanubeProduct.seo_title === 'string' ? tiendanubeProduct.seo_title :
       tiendanubeProduct.seo_title.es || tiendanubeProduct.seo_title.en || tiendanubeProduct.seo_title.pt || null) : null;

    const seo_description = tiendanubeProduct.seo_description ?
      (typeof tiendanubeProduct.seo_description === 'string' ? tiendanubeProduct.seo_description :
       tiendanubeProduct.seo_description.es || tiendanubeProduct.seo_description.en || tiendanubeProduct.seo_description.pt || null) : null;

    const converted = {
      id: tiendanubeProduct.id,
      name,
      description,
      handle,
      seo_title: seo_title,
      seo_description: seo_description,
      published: tiendanubeProduct.published ?? null,
      free_shipping: tiendanubeProduct.free_shipping ?? null,
      video_url: tiendanubeProduct.video_url || null,
      tags: tiendanubeProduct.tags || null,
      brand: tiendanubeProduct.brand || null,
      sku: variant?.sku || undefined,
      price: variant?.price ? parseFloat(variant.price) : undefined,
      stock: variant?.stock || 0,
      // Propiedades específicas de TiendaNube
      tiendanube_id: tiendanubeProduct.id,
      tiendanube_product_id: tiendanubeProduct.id,
      tiendanube_sku: variant?.sku || null,
      promotional_price: variant?.promotional_price ? parseFloat(variant.promotional_price) : null,
      weight: variant?.weight ? parseFloat(variant.weight) : null,
      cost: variant?.cost ? parseFloat(variant.cost) : null,
      created_at: tiendanubeProduct.created_at,
      updated_at: tiendanubeProduct.updated_at,
    };

    // Log de conversión para debugging (solo para los primeros productos)
    if (tiendanubeProduct.id <= 2) {
      console.log(`🔄 [TiendaNube Provider] Converting detailed product ${tiendanubeProduct.id}:`);
      console.log(`   Original product:`, {
        id: tiendanubeProduct.id,
        name: tiendanubeProduct.name,
        description: tiendanubeProduct.description,
        handle: tiendanubeProduct.handle,
        seo_title: tiendanubeProduct.seo_title,
        published: tiendanubeProduct.published,
        variants_count: tiendanubeProduct.variants?.length || 0,
        images_count: tiendanubeProduct.images?.length || 0,
      });
      console.log(`   Converted:`, {
        id: converted.id,
        name: converted.name,
        description: converted.description,
        handle: converted.handle,
        seo_title: converted.seo_title,
        published: converted.published,
        price: converted.price,
        stock: converted.stock,
        cost: converted.cost,
      });
    }

    return converted;
  }
}
