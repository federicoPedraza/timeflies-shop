export interface TiendanubeError {
  error: string;
}

export interface TiendanubeValidationError {
  [field: string]: string[];
}

export interface TiendanubePaginationLinks {
  next?: string;
  last?: string;
  first?: string;
  prev?: string;
}

export interface TiendanubeResponse<T> {
  data: T;
  headers: {
    'x-total-count'?: string;
    'link'?: string;
  };
}

export interface TiendanubeConfig {
  appId: string;
  userAgent: string;
  accessToken: string;
}

export interface TiendanubeRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

// Tipos específicos para la API de Tiendanube
export interface TiendanubeStoreLanguage {
  currency: string;
  active: boolean;
}

export interface TiendanubeStoreLanguages {
  [language: string]: TiendanubeStoreLanguage;
}

export interface TiendanubeStoreName {
  en: string;
  es: string;
  pt: string;
}

export interface TiendanubeStoreDescription {
  en: string;
  es: string;
  pt: string;
}

export interface TiendanubeStore {
  address: string | null;
  admin_language: string;
  blog: string | null;
  business_id: string | null;
  business_name: string | null;
  business_address: string | null;
  contact_email: string;
  country: string;
  created_at: string;
  customer_accounts: string;
  description: TiendanubeStoreDescription;
  domains: string[];
  email: string;
  facebook: string | null;
  google_plus: string | null;
  id: number;
  instagram: string | null;
  languages: TiendanubeStoreLanguages;
  logo: string | null;
  main_currency: string;
  current_theme: string;
  main_language: string;
  name: TiendanubeStoreName;
  original_domain: string;
  phone: string | null;
  whatsapp_phone_number: string | null;
  pinterest: string | null;
  plan_name: string;
  type: string | null;
  twitter: string | null;
  features: string[];
}
