import type { ApiResponse } from '@caseflow/types'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const normalizedPath = path.startsWith('/api') ? path : `/api${path}`
  const res = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  })

  const data = await res.json()
  return data as ApiResponse<T>
}

export const api = {
  get<T>(path: string, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, { 
      method: 'GET',
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    })
  },

  post<T>(path: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'POST',
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    })
  },

  patch<T>(path: string, body: unknown, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    })
  },

  put<T>(path: string, body: unknown, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    })
  },

  delete<T>(path: string, token?: string): Promise<ApiResponse<T>> {
    return request<T>(path, { 
      method: 'DELETE',
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    })
  },
}

export const apiClient = api
