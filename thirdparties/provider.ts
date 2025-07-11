export interface Product {
  id: string | number;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
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
