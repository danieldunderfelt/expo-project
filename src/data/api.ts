import { observable } from '@legendapp/state'
import type { ApiOrder, InsertOrderChange, Product } from '~/data/types.ts'
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

type Resource = 'products' | 'orders'

export const apiState$ = observable({
  offline: false,
})

/**
 * A generic API client to interact with the mock server.
 * @param endpoint The resource endpoint (e.g., 'products', 'orders/123').
 * @param options The request options (method, body, etc.).
 * @returns The JSON response from the server.
 */
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    if (apiState$.offline.get()) {
      return null
    }

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
      return null
    }

    return response.json()
  } catch (error) {
    console.error('API Client Error:', error)
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

const applyOrderChanges = (changes: InsertOrderChange[]) => {
  return apiClient<ApiOrder[]>('orders/apply-changes', {
    method: 'POST',
    body: JSON.stringify(changes),
  })
}

export const api = {
  products: {
    getAll: getItems<Product>('products'),
    getOne: getItem<Product>('products'),
    update: updateItem<Product>('products'),
  },
  orders: {
    getAll: getItems<ApiOrder>('orders'),
    getOne: getItem<ApiOrder>('orders'),
    update: updateItem<ApiOrder>('orders'),
    applyChanges: applyOrderChanges,
  },
}
