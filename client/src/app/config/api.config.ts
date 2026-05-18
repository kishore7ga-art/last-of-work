import { environment } from '../../environments/environment';

declare global {
  interface Window {
    __env?: {
      API_URL?: string;
    };
  }
}

export function getApiBaseUrl(): string {
  const runtimeUrl = window.__env?.API_URL;
  const baseUrl = (runtimeUrl || environment.apiUrl).replace(/\/$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}
