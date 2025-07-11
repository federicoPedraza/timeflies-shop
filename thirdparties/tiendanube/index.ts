import { TiendanubeClient } from './client';

export type {
  TiendanubeConfig,
  TiendanubeRequestOptions,
  TiendanubeResponse,
  TiendanubeError,
  TiendanubeValidationError,
  TiendanubePaginationLinks,
  TiendanubeStore,
  TiendanubeStoreLanguage,
  TiendanubeStoreLanguages,
  TiendanubeStoreName,
  TiendanubeStoreDescription
} from './types';

export function createTiendanubeClient(
  appId: string,
  userAgent: string,
  accessToken: string
): TiendanubeClient {
  return new TiendanubeClient({
    appId,
    userAgent,
    accessToken
  });
}
