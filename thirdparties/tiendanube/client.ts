import { TiendanubeConfig, TiendanubeRequestOptions, TiendanubeResponse, TiendanubeError, TiendanubeValidationError, TiendanubeStore } from './types';

export class TiendanubeClient {
  private config: TiendanubeConfig;
  private baseUrl = 'https://api.tiendanube.com/2025-03';

  constructor(config: TiendanubeConfig) {
    this.config = config;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseUrl}/${this.config.appId}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private parseLinkHeader(linkHeader: string): Record<string, string> {
    const links: Record<string, string> = {};

    if (!linkHeader) return links;

    const linkRegex = /<([^>]+)>;\s*rel="([^"]+)"/g;
    let match;

    while ((match = linkRegex.exec(linkHeader)) !== null) {
      const [, url, rel] = match;
      links[rel] = url;
    }

    return links;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: TiendanubeRequestOptions = {}
  ): Promise<TiendanubeResponse<T>> {
    const {
      method = 'GET',
      body,
      params,
      headers = {}
    } = options;

    const url = this.buildUrl(endpoint, params);

    const requestHeaders: Record<string, string> = {
      'Authentication': `bearer ${this.config.accessToken}`,
      'User-Agent': this.config.userAgent,
      ...headers
    };

    // Agregar Content-Type para requests con body
    if (body && (method === 'POST' || method === 'PUT')) {
      requestHeaders['Content-Type'] = 'application/json; charset=utf-8';
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      // Manejar diferentes códigos de estado
      if (!response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          const errorData = await response.json();

          if (response.status === 400) {
            const error = errorData as TiendanubeError;
            throw new Error(`Error de parsing JSON: ${error.error}`);
          } else if (response.status === 422) {
            const validationError = errorData as TiendanubeValidationError;
            const errorMessages = Object.entries(validationError)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('; ');
            throw new Error(`Error de validación: ${errorMessages}`);
          } else if (response.status >= 500) {
            throw new Error(`Error del servidor Tiendanube (${response.status}): ${response.statusText}`);
          } else {
            throw new Error(`Error de la API: ${response.status} ${response.statusText}`);
          }
        } else {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Extraer headers importantes
      const responseHeaders = {
        'x-total-count': response.headers.get('x-total-count') || undefined,
        'link': response.headers.get('link') || undefined,
      };

      return {
        data,
        headers: responseHeaders
      };

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido en la solicitud a Tiendanube');
    }
  }

  // Método para obtener información de la tienda
  async getStore(): Promise<TiendanubeResponse<TiendanubeStore>> {
    return this.makeRequest<TiendanubeStore>('/store');
  }

  // Métodos específicos para diferentes endpoints
  async getProducts(params?: { page?: number; per_page?: number }) {
    return this.makeRequest('/products', { params });
  }

  async getProduct(productId: string) {
    return this.makeRequest(`/products/${productId}`);
  }

  async createProduct(productData: any) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: productData
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: productData
    });
  }

  async deleteProduct(productId: string) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
  }

  // Método genérico para cualquier endpoint
  async request<T>(endpoint: string, options?: TiendanubeRequestOptions): Promise<TiendanubeResponse<T>> {
    return this.makeRequest<T>(endpoint, options);
  }
}
