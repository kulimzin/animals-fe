// @vitest-environment jsdom

import { z } from 'zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const firstToken = 'a'.repeat(43)
const secondToken = 'b'.repeat(43)

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
  vi.unstubAllGlobals()
})

describe('apiRequest', () => {
  it('issues one client token for concurrent authenticated requests', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/v1/clients') {
        return Promise.resolve(jsonResponse({ data: { token: firstToken } }, 201))
      }

      expect(new Headers(init?.headers).get('Authorization')).toBe(`Bearer ${firstToken}`)
      return Promise.resolve(jsonResponse({ ok: true }))
    })
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await import('./apiClient')
    const schema = z.object({ ok: z.boolean() })

    await Promise.all([apiRequest('/animals', schema), apiRequest('/config', schema)])

    expect(fetchMock.mock.calls.filter(([input]) => input === '/api/v1/clients')).toHaveLength(1)
    expect(localStorage.getItem('animals.clientToken')).toBe(firstToken)
  })

  it('reuses a stored client token', async () => {
    localStorage.setItem('animals.clientToken', firstToken)
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).get('Authorization')).toBe(`Bearer ${firstToken}`)
      return Promise.resolve(jsonResponse({ ok: true }))
    })
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await import('./apiClient')

    await apiRequest('/animals', z.object({ ok: z.boolean() }))

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('replaces an invalid token and retries the request once', async () => {
    localStorage.setItem('animals.clientToken', firstToken)
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (input === '/api/v1/clients') {
        return Promise.resolve(jsonResponse({ data: { token: secondToken } }, 201))
      }

      const authorization = new Headers(init?.headers).get('Authorization')
      if (authorization === `Bearer ${firstToken}`) {
        return Promise.resolve(
          jsonResponse(
            {
              error: { code: 'CLIENT_TOKEN_INVALID', message: 'Client token is invalid' },
              requestId: 'request-1',
            },
            401,
          ),
        )
      }

      expect(authorization).toBe(`Bearer ${secondToken}`)
      return Promise.resolve(jsonResponse({ ok: true }))
    })
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await import('./apiClient')

    await apiRequest('/animals', z.object({ ok: z.boolean() }))

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(localStorage.getItem('animals.clientToken')).toBe(secondToken)
  })
})
