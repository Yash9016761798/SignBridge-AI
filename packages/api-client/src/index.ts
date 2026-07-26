/**
 * SignBridge AI API Client
 *
 * This package will contain generated API clients for communicating
 * with the NestJS backend and FastAPI AI service.
 *
 * TODO: Generate API clients from OpenAPI specifications
 * - Backend API client from Swagger/OpenAPI
 * - AI Service API client from FastAPI OpenAPI
 */

export const API_CLIENT_VERSION = '0.1.0';

export interface ApiClientConfig {
  baseUrl: string;
  aiBaseUrl: string;
  timeout?: number;
}

export function createApiClient(_config: ApiClientConfig) {
  // Placeholder for API client implementation
  // Will be replaced with generated clients from OpenAPI specs
  return {
    health: {
      check: async () => ({ status: 'ok' as const }),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
