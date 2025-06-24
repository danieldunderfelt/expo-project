import Constants from 'expo-constants'
import { Platform } from 'react-native'

const getApiUrl = (): string => {
  if (Platform.OS === 'web') {
    // On web, we can use localhost.
    return 'http://localhost:3000'
  }

  // When running in an emulator/simulator or on a physical device with Expo Go,
  // we can get the host machine's IP address from the manifest.
  // The hostUri is typically in the format '192.168.x.x:19000'.
  const hostUri = Constants.expoConfig?.hostUri
  const ipAddress = hostUri?.split(':')[0]

  if (ipAddress) {
    return `http://${ipAddress}:3000`
  }

  // Fallback for Android emulator if hostUri is not available
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'
  }

  // Default fallback for iOS simulator
  return 'http://localhost:3000'
}

const API_URL = getApiUrl()

// --- TYPE DEFINITIONS (from mock-server.ts) ---
export type Product = {
  id: string
  name: string
  price: number
  created_at: number
  updated_at: number
}

export type Order = {
  id: string
  name: string
  product_id: string
  quantity: number
  unit: 'kg' | 'pcs' | 'liter'
  department: string
  created_at: number
  updated_at: number
  deleted_at: number | null
}

type Resource = 'products' | 'orders'

/**
 * A generic API client to interact with the mock server.
 * @param endpoint The resource endpoint (e.g., 'products', 'orders/123').
 * @param options The request options (method, body, etc.).
 * @returns The JSON response from the server.
 */
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        error: `Request failed with status ${response.status}`,
      }))
      throw new Error(errorBody.error || 'API request failed')
    }

    if (response.status === 204) {
      return null as T // For DELETE requests that might not return content
    }

    return response.json()
  } catch (error) {
    console.error('API Client Error:', error)
    // Re-throw the error so it can be caught by the caller (e.g., React Query)
    throw error
  }
}

// --- GENERIC RESOURCE HANDLERS ---
type FilterParams = Record<string, string | number | boolean>

const getItems =
  <T>(resource: Resource) =>
  (filters?: FilterParams) => {
    const params = new URLSearchParams()
    if (filters) {
      for (const key in filters) {
        if (Object.prototype.hasOwnProperty.call(filters, key)) {
          params.append(key, String(filters[key]))
        }
      }
    }
    const queryString = params.toString()
    return apiClient<T[]>(`${resource}${queryString ? `?${queryString}` : ''}`)
  }

const getItem =
  <T>(resource: Resource) =>
  (id: string) => {
    return apiClient<T>(`${resource}/${id}`)
  }

const updateItem =
  <T>(resource: Resource) =>
  (id: string, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>) => {
    return apiClient<T>(`${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

const deleteItem =
  <T>(resource: Resource) =>
  (id: string) => {
    return apiClient<T>(`${resource}/${id}`, {
      method: 'DELETE',
    })
  }

// --- EXPORTED API CLIENT ---
export const api = {
  products: {
    getAll: getItems<Product>('products'),
    getOne: getItem<Product>('products'),
    update: updateItem<Product>('products'),
    delete: deleteItem<Product>('products'),
  },
  orders: {
    getAll: getItems<Order>('orders'),
    getOne: getItem<Order>('orders'),
    update: updateItem<Order>('orders'),
    delete: deleteItem<Order>('orders'),
  },
}
