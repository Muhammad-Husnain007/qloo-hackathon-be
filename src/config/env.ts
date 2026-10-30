import 'dotenv/config'

function readQlooMode(value: string | undefined, apiKey: string | undefined): 'live' | 'mock' {
  const mode = value?.trim().toLowerCase() ?? 'auto'
  if (mode === 'auto') return apiKey?.trim() ? 'live' : 'mock'
  if (mode === 'live' || mode === 'mock') return mode
  throw new Error('QLOO_MODE must be auto, live, or mock')
}

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3001)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }
  return port
}

export const env = {
  port: readPort(process.env.PORT),
  frontendOrigins: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  aiProvider: (process.env.AI_PROVIDER ?? (process.env.AI_API_KEY ? 'gemini' : 'openai-compatible')).trim().toLowerCase(),
  llmApiKey: process.env.AI_API_KEY?.trim() || process.env.LLM_API_KEY?.trim() || undefined,
  llmBaseUrl: (process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, ''),
  geminiBaseUrl: (process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
  llmModel: process.env.AI_MODEL?.trim() || process.env.LLM_MODEL?.trim() || 'gpt-4o-mini',
  llmFallbackModels: (process.env.AI_FALLBACK_MODELS ?? '').split(',').map((model) => model.trim()).filter(Boolean),
  qlooApiKey: process.env.QLOO_API_KEY?.trim() || undefined,
  qlooBaseUrl: (process.env.QLOO_BASE_URL ?? 'https://hackathon.api.qloo.com').replace(/\/$/, ''),
  qlooMode: readQlooMode(process.env.QLOO_MODE, process.env.QLOO_API_KEY),
}
