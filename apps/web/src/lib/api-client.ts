import { config } from './config'
import type { ApiResponse } from '@caseflow/types'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await res.json()
  return data as ApiResponse<T>
}

export const apiClient = {
  post<T>(path: string, body: unknown, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },

  patch<T>(path: string, body: unknown, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },

  get<T>(path: string, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },
}
