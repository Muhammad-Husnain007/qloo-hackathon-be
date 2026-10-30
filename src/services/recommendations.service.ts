import { env } from '../config/env.js'
import { categoryQuestions, mockRecommendations } from '../data/mockRecommendations.js'
import { AppError } from '../middleware/errors.js'
import type { Category, ChatHistoryMessage, ChatResponse, Recommendation } from '../types/recommendations.js'
import { getInsights, searchTags } from './qloo/client.js'
import type { QlooTag } from './qloo/schemas.js'
import { genericPreferencePlan, mapAnswersToQloo, type QlooPlan } from './qloo/mapper.js'

type Source = 'qloo' | 'mock'
type RecommendationList = { category: Category; source: Source; recommendations: Recommendation[] }

function selectTag(tags: QlooTag[], query: string): QlooTag | undefined {
  const normalized = query.toLocaleLowerCase().trim()
  return tags.find((tag) => tag.name.toLocaleLowerCase().trim() === normalized)
    ?? tags.find((tag) => tag.name.toLocaleLowerCase().includes(normalized) || normalized.includes(tag.name.toLocaleLowerCase()))
}

async function resolvePlan(plan: QlooPlan) {
  const signals = await Promise.all(plan.tasteSignals.map(async (label) => {
    const tag = selectTag(await searchTags(label), label)
    return tag ? { label, tag } : undefined
  }))
  const filters = await Promise.all(plan.categoryFilters.map(async (label) => {
    const tag = selectTag(await searchTags(label), label)
    return tag
  }))

  const resolvedSignals = signals.filter((entry): entry is { label: string; tag: QlooTag } => Boolean(entry))
  const resolvedFilters = filters.filter((tag): tag is QlooTag => Boolean(tag))
  if (plan.tasteSignals.length > 0 && resolvedSignals.length === 0) {
    throw new AppError(422, 'QLOO_TAG_NOT_FOUND', 'Qloo could not match the selected preferences to supported taste tags. Try a broader preference.')
  }
  if (plan.categoryFilters.length > 0 && resolvedFilters.length === 0) {
    throw new AppError(422, 'QLOO_CATEGORY_TAG_NOT_FOUND', 'Qloo did not return a matching category tag, so safe category filtering is unavailable. Try a different preference.')
  }

  const params = new URLSearchParams(plan.params)
  if (resolvedSignals.length) params.set('signal.interests.tags', resolvedSignals.map(({ tag }) => tag.tag_id).join(','))
  if (resolvedFilters.length) params.set('filter.tags', resolvedFilters.map((tag) => tag.tag_id).join(','))
  return { params, resolvedSignals, resolvedFilters }
}

function toRecommendation(category: Category, entity: Awaited<ReturnType<typeof getInsights>>[number], rank: number, tags: string[]): Recommendation {
  const displayType = entity.subtype?.replace(/^urn:entity:/, '') ?? entity.type?.replace(/^urn:entity:/, '') ?? category.slice(0, -1)
  return {
    id: entity.entity_id,
    title: entity.name,
    subtitle: displayType,
    rank,
    imageUrl: entity.properties?.image?.url,
    explanation: 'Qloo returned this item in its affinity-ranked results for your selected taste signals.',
    tags,
  }
}

async function getQlooRecommendations(category: Category, plan: QlooPlan): Promise<RecommendationList> {
  const { params, resolvedSignals } = await resolvePlan(plan)
  const entities = await getInsights(params)
  const tags = resolvedSignals.map(({ tag }) => tag.name)
  return { category, source: 'qloo', recommendations: entities.map((entity, index) => toRecommendation(category, entity, index + 1, tags)) }
}

function getLocalMockRecommendations(category: Category, preferences?: string): RecommendationList {
  let recommendations = mockRecommendations[category]
  if (preferences?.trim()) {
    const terms = preferences.toLowerCase().split(/[\s,;]+/).filter((term) => term.length > 2)
    recommendations = [...recommendations].sort((a, b) => score(b, terms) - score(a, terms))
  }
  return { category, source: 'mock', recommendations }

  function score(item: Recommendation, terms: string[]) {
    const searchable = `${item.title} ${item.subtitle} ${item.tags.join(' ')} ${item.explanation}`.toLowerCase()
    return terms.reduce((sum, term) => sum + (searchable.includes(term) ? 1 : 0), 0)
  }
}

export async function getRecommendations(category: Category, preferences?: string): Promise<RecommendationList> {
  if (env.qlooMode === 'mock') return getLocalMockRecommendations(category, preferences)
  if (!preferences?.trim()) {
    throw new AppError(400, 'PREFERENCES_REQUIRED', 'Provide preferences to get personalized live Qloo recommendations.')
  }
  return getQlooRecommendations(category, genericPreferencePlan(category, preferences))
}

export async function getChatResponse(
  category: Category,
  answers: string[],
  _history: ChatHistoryMessage[],
): Promise<ChatResponse> {
  const questions = categoryQuestions[category]
  const nextQuestion = questions[answers.length]
  if (nextQuestion) {
    return {
      type: 'question', category,
      question: nextQuestion.question,
      quickReplies: nextQuestion.quickReplies,
      progress: { answered: answers.length, total: questions.length },
    }
  }

  const results = env.qlooMode === 'mock'
    ? getLocalMockRecommendations(category, answers.join(' '))
    : await getQlooRecommendations(category, mapAnswersToQloo(category, answers))
  return {
    type: 'recommendations', category, source: results.source,
    message: results.source === 'mock'
      ? 'LOCAL MOCK RESULTS — Qloo API key is not configured. Add QLOO_API_KEY in backend-be/.env to use live Qloo recommendations.'
      : 'Here are Qloo recommendations ranked by affinity to your selected taste signals. Qloo affinity is a relative score.',
    recommendations: results.recommendations,
  }
}
