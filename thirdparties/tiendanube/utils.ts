import { TiendanubePaginationLinks } from './types';

export function parsePaginationLinks(linkHeader: string): TiendanubePaginationLinks {
  const links: TiendanubePaginationLinks = {};

  if (!linkHeader) return links;

  const linkRegex = /<([^>]+)>;\s*rel="([^"]+)"/g;
  let match;

  while ((match = linkRegex.exec(linkHeader)) !== null) {
    const [, url, rel] = match;
    links[rel as keyof TiendanubePaginationLinks] = url;
  }

  return links;
}

export function extractPageFromUrl(url: string): number | null {
  try {
    const urlObj = new URL(url);
    const page = urlObj.searchParams.get('page');
    return page ? parseInt(page, 10) : null;
  } catch {
    return null;
  }
}

export function buildPaginationParams(page?: number, perPage?: number): Record<string, string> {
  const params: Record<string, string> = {};

  if (page !== undefined) {
    params.page = page.toString();
  }

  if (perPage !== undefined) {
    params.per_page = perPage.toString();
  }

  return params;
}

export function validateTiendanubeConfig(config: {
  appId?: string;
  userAgent?: string;
  accessToken?: string;
}): string[] {
  const errors: string[] = [];

  if (!config.appId) {
    errors.push('TIENDANUBE_APP_ID es requerido');
  }

  if (!config.userAgent) {
    errors.push('TIENDANUBE_USER_AGENT es requerido');
  }

  if (!config.accessToken) {
    errors.push('ACCESS_TOKEN es requerido');
  }

  return errors;
}

export function formatTiendanubeError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'error' in error) {
    return error.error;
  }

  return 'Error desconocido de Tiendanube';
}
