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
}

export interface TiendanubeProduct {
  id: number;
  name: {
    en: string;
    es: string;
    pt: string;
  };
  created_at: string;
  updated_at: string;
  variants: TiendanubeVariant[];
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
      while (true) {
        const response = await this.client.getProducts({ page, per_page: perPage });
        const products = response.data as TiendanubeProduct[];

        if (!products || products.length === 0) {
          break;
        }

        // Log de la respuesta raw de TiendaNube para debugging
        if (page === 1) {
          console.log('🔍 [TiendaNube Provider] Raw API response (first 2 products):');
          products.slice(0, 2).forEach((product, index) => {
            console.log(`📦 [TiendaNube Provider] Raw product ${index + 1}:`, JSON.stringify(product, null, 2));
          });
        }

        // Convertir productos de TiendaNube al formato estándar
        const convertedProducts = products.map(product => this.convertToStandardProduct(product));
        allProducts.push(...convertedProducts);

        // Verificar si hay más páginas
        const totalCount = response.headers['x-total-count'];
        if (totalCount && allProducts.length >= parseInt(totalCount)) {
          break;
        }

        page++;
      }

      return allProducts;
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

  private convertToStandardProduct(tiendanubeProduct: TiendanubeProduct): Product {
    // Obtener la primera variante (asumiendo que es la principal)
    const variant = tiendanubeProduct.variants?.[0];

    if (!variant) {
      console.warn(`⚠️ [TiendaNube Provider] Product ${tiendanubeProduct.id} has no variants`);
    }

    const converted = {
      id: tiendanubeProduct.id,
      name: tiendanubeProduct.name.es || tiendanubeProduct.name.en || tiendanubeProduct.name.pt || 'Sin nombre',
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
      console.log(`🔄 [TiendaNube Provider] Converting product ${tiendanubeProduct.id}:`);
      console.log(`   Original product:`, {
        id: tiendanubeProduct.id,
        name: tiendanubeProduct.name,
        variants_count: tiendanubeProduct.variants?.length || 0,
      });
      console.log(`   Original variant:`, variant ? {
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        cost: variant.cost,
      } : 'No variant found');
      console.log(`   Converted:`, {
        id: converted.id,
        name: converted.name,
        sku: converted.sku,
        tiendanube_sku: converted.tiendanube_sku,
        price: converted.price,
        stock: converted.stock,
        cost: converted.cost,
      });
    }

    return converted;
  }
}
