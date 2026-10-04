import { z } from 'zod'
import type { CreateClientResponses } from './generated'

const CLIENT_TOKEN_STORAGE_KEY = 'animals.clientToken'

const clientTokenResponseSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
})

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z
      .array(
        z.object({
          field: z.string(),
          code: z.string(),
        }),
      )
      .optional(),
    retryAfterSeconds: z.number().int().positive().optional(),
    availableAt: z.iso.datetime().optional(),
  }),
  requestId: z.string().min(1),
})

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

let memoryClientToken: string | null = null
let clientTokenRequest: Promise<string> | null = null

function readStoredClientToken() {
  try {
    return localStorage.getItem(CLIENT_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeClientToken(token: string) {
  memoryClientToken = token
  try {
    localStorage.setItem(CLIENT_TOKEN_STORAGE_KEY, token)
  } catch {
    // The in-memory token still keeps the current page session usable.
  }
}

function clearClientToken(token: string) {
  if (memoryClientToken === token) {
    memoryClientToken = null
  }

  try {
    if (localStorage.getItem(CLIENT_TOKEN_STORAGE_KEY) === token) {
      localStorage.removeItem(CLIENT_TOKEN_STORAGE_KEY)
    }
  } catch {
    // Storage may be unavailable; the in-memory token was already cleared.
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const json = response.json() as Promise<unknown>
    return await json
  } catch {
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'API returned invalid JSON')
  }
}

async function throwApiError(response: Response): Promise<never> {
  const body = await readJson(response)
  const parsedError = errorResponseSchema.safeParse(body)

  if (parsedError.success) {
    throw new ApiError(
      response.status,
      parsedError.data.error.code,
      parsedError.data.error.message,
      parsedError.data.requestId,
    )
  }

  throw new ApiError(response.status, 'INVALID_RESPONSE', 'API returned an unexpected error')
}

async function issueClientToken() {
  const response = await fetch('/api/v1/clients', {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    return throwApiError(response)
  }

  const parsedResponse: CreateClientResponses[201] = clientTokenResponseSchema.parse(
    await readJson(response),
  )
  storeClientToken(parsedResponse.token)
  return parsedResponse.token
}

async function getClientToken() {
  const storedToken = memoryClientToken ?? readStoredClientToken()
  if (storedToken) {
    memoryClientToken = storedToken
    return storedToken
  }

  if (!clientTokenRequest) {
    clientTokenRequest = issueClientToken().finally(() => {
      clientTokenRequest = null
    })
  }

  return clientTokenRequest
}

async function sendAuthenticatedRequest(path: string, init: RequestInit, token: string) {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`/api/v1${path}`, { ...init, headers })
}

export async function apiRequest<T>(path: string, schema: z.ZodType<T>, init: RequestInit = {}) {
  let token = await getClientToken()
  let response = await sendAuthenticatedRequest(path, init, token)

  if (response.status === 401) {
    const body = await readJson(response)
    const parsedError = errorResponseSchema.safeParse(body)

    if (parsedError.success && parsedError.data.error.code === 'CLIENT_TOKEN_INVALID') {
      clearClientToken(token)
      token = await getClientToken()
      response = await sendAuthenticatedRequest(path, init, token)
    } else {
      if (parsedError.success) {
        throw new ApiError(
          response.status,
          parsedError.data.error.code,
          parsedError.data.error.message,
          parsedError.data.requestId,
        )
      }
      throw new ApiError(response.status, 'INVALID_RESPONSE', 'API returned an unexpected error')
    }
  }

  if (!response.ok) {
    return throwApiError(response)
  }

  return schema.parse(await readJson(response))
}
