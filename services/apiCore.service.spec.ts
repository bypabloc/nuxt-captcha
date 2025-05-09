/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiCoreService } from './apiCore.service'
const pushMock = vi.fn()
const baseUrl = 'https://api.example.com'

vi.mock('#app', async () => {
  const actual = await vi.importActual<any>('#app')
  return {
    ...actual,
    useRuntimeConfig: vi.fn(() => ({
      public: {
        apiBaseUrl: 'https://api.example.com',
      },
    })),
    useRouter: vi.fn(() => ({
      push: pushMock,
    })),
  }
})

describe('apiCoreService', () => {
  const mockFetch = vi.fn()
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }

  beforeEach(() => {
    global.fetch = mockFetch
    global.localStorage = mockLocalStorage as any
    mockLocalStorage.getItem.mockReturnValue('test-token')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should make a GET request with auth token', async () => {
    const mockResponse = {
      status: true,
      detail: 'Success',
      data: { id: 1, name: 'Test' },
    }

    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await apiCoreService.request(`/test`, {
      method: 'GET',
      useAuth: true,
    })

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'JWT test-token',
      },
    })

    expect(result).toEqual({
      statusCode: 200,
      code: null,
      ...mockResponse,
    })
  })

  it('should make a POST request with payload', async () => {
    const payload = { name: 'Test', value: 123 }
    const mockResponse = {
      status: true,
      detail: 'Created',
      data: { id: 2 },
    }

    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await apiCoreService.request('/test', {
      method: 'POST',
      payload,
      useAuth: true,
    })

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'JWT test-token',
      },
      body: JSON.stringify(payload),
    })

    expect(result).toEqual({
      statusCode: 201,
      code: null,
      ...mockResponse,
    })
  })

  it('should make a request without auth when useAuth is false', async () => {
    const mockResponse = {
      status: true,
      detail: 'Success',
      data: { public: true },
    }

    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await apiCoreService.request('/public', {
      method: 'GET',
      useAuth: false,
    })

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    expect(result).toEqual({
      statusCode: 200,
      code: null,
      ...mockResponse,
    })
  })

  it('should redirect to logout page when receiving a 401 response', async () => {
    const payload = { name: 'Test', value: 123 }
    const mockResponse = {
      status: false,
      code: 'error',
      detail: 'error',
      data: {},
    }

    mockFetch.mockResolvedValueOnce({
      status: 401,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await apiCoreService.request('/test', {
      method: 'POST',
      payload,
      useAuth: true,
    })

    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'JWT test-token',
      },
      body: JSON.stringify(payload),
    })

    expect(result).toEqual({
      statusCode: 401,
      ...mockResponse,
    })

    expect(pushMock).toHaveBeenCalledExactlyOnceWith('/logout')
  })

  it('should return generic error when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    const result = await apiCoreService.request('/test', {
      method: 'GET',
      useAuth: false,
    })

    expect(result).toEqual({
      statusCode: 500,
      code: null,
      status: false,
      detail: 'Unknown error',
      data: {},
    })
  })
})
