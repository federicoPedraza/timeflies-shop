export interface Product {
  id: string | number;
  name: string;
  description?: string | null;
  handle?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published?: boolean | null;
  free_shipping?: boolean | null;
  video_url?: string | null;
  tags?: string | null;
  brand?: string | null;
  sku?: string;
  price?: number;
  stock?: number;
  // Tiendanube specific fields
  tiendanube_id?: number;
  tiendanube_product_id?: number;
  tiendanube_sku?: string | null;
  promotional_price?: number | null;
  weight?: number | null;
  cost?: number | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Para propiedades adicionales específicas del proveedor
}

export interface ProviderConfig {
  [key: string]: any;
}

export abstract class Provider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Obtiene todos los productos del proveedor
   */
  abstract getProducts(): Promise<Product[]>;

  /**
   * Obtiene un producto específico por ID
   */
  abstract getProduct(id: string | number): Promise<Product | null>;

  /**
   * Valida la configuración del proveedor
   */
  abstract validateConfig(): boolean;

  /**
   * Obtiene el nombre del proveedor
   */
  abstract getProviderName(): string;
}
