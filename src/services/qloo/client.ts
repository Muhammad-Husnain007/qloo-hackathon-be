import { env } from '../../config/env.js'
import { AppError } from '../../middleware/errors.js'
import { qlooInsightsResponseSchema, qlooTagsResponseSchema } from './schemas.js'

const REQUEST_TIMEOUT_MS = 12_000

async function requestJson(path: string, params: URLSearchParams): Promise<unknown> {
  if (!env.qlooApiKey) {
    throw new AppError(503, 'QLOO_API_KEY_MISSING', 'Qloo live mode requires QLOO_API_KEY in backend-be/.env.')
  }

  const url = new URL(path, `${env.qlooBaseUrl}/`)
  url.search = params.toString()
  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json', 'X-Api-Key': env.qlooApiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new AppError(504, 'QLOO_TIMEOUT', 'Qloo did not respond before the request timed out.')
    }
    throw new AppError(502, 'QLOO_UNAVAILABLE', 'Could not connect to Qloo. Check the backend network and Qloo base URL.')
  }

  if (!response.ok) {
    // Do not echo upstream response bodies or credentials to the client.
    if (response.status === 401 || response.status === 403) {
      throw new AppError(502, 'QLOO_AUTH_FAILED', 'Qloo rejected the configured API key or API host.')
    }
    if (response.status === 429) {
      throw new AppError(503, 'QLOO_RATE_LIMITED', 'Qloo rate limit reached. Please try again shortly.')
    }
    throw new AppError(502, 'QLOO_REQUEST_FAILED', `Qloo returned HTTP ${response.status}.`)
  }

  try {
    return await response.json() as unknown
  } catch {
    throw new AppError(502, 'QLOO_INVALID_RESPONSE', 'Qloo returned a response that was not valid JSON.')
  }
}

export async function searchTags(query: string) {
  const params = new URLSearchParams({ 'filter.query': query, take: '10', 'feature.typo_tolerance': 'true' })
  const payload = await requestJson('/v2/tags', params)
  const parsed = qlooTagsResponseSchema.safeParse(payload)
  if (!parsed.success || parsed.data.success === false) {
    throw new AppError(502, 'QLOO_INVALID_RESPONSE', 'Qloo returned an unexpected tag-search response.')
  }
  return parsed.data.results.tags
}

export async function getInsights(params: URLSearchParams) {
  const payload = await requestJson('/v2/insights', params)
  const parsed = qlooInsightsResponseSchema.safeParse(payload)
  if (!parsed.success || parsed.data.success === false) {
    throw new AppError(502, 'QLOO_INVALID_RESPONSE', 'Qloo returned an unexpected Insights response.')
  }
  return parsed.data.results.entities
}
