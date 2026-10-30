import { env } from '../config/env.js'
import type { Category, ChatHistoryMessage, Recommendation } from '../types/recommendations.js'

type Selection = { recommendationIds?: unknown; message?: unknown }

export async function selectRecommendationsWithLlm(
  category: Category,
  answers: string[],
  history: ChatHistoryMessage[],
  candidates: Recommendation[],
): Promise<{ recommendations: Recommendation[]; message: string } | undefined> {
  if (!env.llmApiKey) return undefined

  const instructions = [
    'You are TasteMate, a concise and warm recommendation assistant.',
    `Category: ${category}. User answers: ${JSON.stringify(answers)}.`,
    `Conversation history: ${JSON.stringify(history.slice(-12))}.`,
    `You may only select from these mock recommendations: ${JSON.stringify(candidates.map(({ id, title, subtitle, tags }) => ({ id, title, subtitle, tags })))}`,
    'Return only JSON with the shape {"recommendationIds":["id",...],"message":"one short personalized sentence"}.',
    'Use only candidate IDs, order the best matches first, and include each candidate at most once.',
  ].join('\n')

  const models = [...new Set([env.llmModel, ...env.llmFallbackModels])]
  let lastError: Error | undefined
  for (const model of models) {
    try {
      const content = env.aiProvider === 'gemini'
        ? await requestGemini(model, instructions)
        : await requestOpenAiCompatible(model, instructions)
      const cleanContent = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      return parseSelection(cleanContent, candidates)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown LLM error')
    }
  }
  throw lastError ?? new Error('No LLM models are configured')
}

async function requestGemini(model: string, instructions: string): Promise<string> {
  const response = await fetch(`${env.geminiBaseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': env.llmApiKey!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'Return valid JSON only. Select only from the provided mock recommendations.' }] },
      contents: [{ role: 'user', parts: [{ text: instructions }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new Error(`Gemini endpoint returned HTTP ${response.status}`)
  const payload = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
  if (!content) throw new Error('Gemini endpoint returned an empty response')
  return content
}

async function requestOpenAiCompatible(model: string, instructions: string): Promise<string> {
  const response = await fetch(`${env.llmBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.llmApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature: 0.3, messages: [{ role: 'user', content: instructions }] }),
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new Error(`LLM endpoint returned HTTP ${response.status}`)
  const payload = await response.json() as { choices?: { message?: { content?: string | null } }[] }
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('LLM endpoint returned an empty response')
  return content
}

function parseSelection(cleanContent: string, candidates: Recommendation[]) {
  const parsed = JSON.parse(cleanContent) as Selection
  const allowed = new Map(candidates.map((item) => [item.id, item]))
  const selected = Array.isArray(parsed.recommendationIds)
    ? parsed.recommendationIds.filter((id): id is string => typeof id === 'string' && allowed.has(id)).map((id) => allowed.get(id)!)
    : []
  const uniqueSelected = [...new Map(selected.map((item) => [item.id, item])).values()]

  return {
    recommendations: uniqueSelected.length ? uniqueSelected : candidates,
    message: typeof parsed.message === 'string' && parsed.message.trim()
      ? parsed.message.trim().slice(0, 240)
      : 'Here are a few thoughtful picks based on what you told me.',
  }
}
