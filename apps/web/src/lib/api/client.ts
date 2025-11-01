import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { storage } from '../storage';
import { ApiError, RefreshTokenResponse } from './types';
import { v4 as uuidv4 } from 'uuid';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token payload interface
interface JwtPayload {
  tenant_id?: number;
  sub?: string;
  iat?: number;
  exp?: number;
}

// Helper to get tenant ID from JWT
function getTenantId(): number | null {
  const token = storage.getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.tenant_id || null;
  } catch {
    return null;
  }
}

// Helper to get locale from URL or default to 'en'
function getLocale(): string {
  if (typeof window === 'undefined') return 'en';

  const pathname = window.location.pathname;
  const locale = pathname.split('/')[1];
  return ['en', 'tr'].includes(locale) ? locale : 'en';
}

// Request interceptor: inject auth headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    const tenantId = getTenantId();
    const locale = getLocale();

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-Tenant-Id header if available
    if (tenantId && config.headers) {
      config.headers['X-Tenant-Id'] = String(tenantId);
    }

    // Add Accept-Language header
    if (config.headers) {
      config.headers['Accept-Language'] = locale;
    }

    // Add Idempotency-Key for payment endpoints (POST/PUT)
    if (
      config.url &&
      (config.url.includes('/client-payments') ||
        config.url.includes('/vendor-payments')) &&
      (config.method === 'post' || config.method === 'put') &&
      config.headers
    ) {
      config.headers['Idempotency-Key'] = uuidv4();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (reason?: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Exclude refresh endpoint from retry
      if (originalRequest.url?.includes('/auth/refresh')) {
        storage.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = `/${getLocale()}/login`;
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.getRefreshToken();

      if (!refreshToken) {
        storage.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = `/${getLocale()}/login`;
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data;

        storage.setTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        storage.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = `/${getLocale()}/login`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
export { apiClient as api };
