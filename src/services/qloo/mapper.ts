import type { Category } from '../../types/recommendations.js'

export type QlooPlan = {
  tasteSignals: string[]
  categoryFilters: string[]
  params: Record<string, string>
  appliedPreferences: string[]
}

const clean = (value: string | undefined) => (value ?? '').replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim()
const usable = (value: string | undefined) => {
  const result = clean(value)
  return result && !/^(skip|no specific preference|anything|surprise me)$/i.test(result) ? result : undefined
}

function restaurantPrice(answer: string | undefined): Record<string, string> {
  const value = clean(answer).toLowerCase()
  // Qloo documents price_level as restaurant price levels 1–4 (higher is
  // more expensive). These are coarse translations of the UI's dollar bands.
  if (value.includes('under $5')) return { 'filter.price_level.max': '1' }
  if (value.includes('$5') && value.includes('$10')) return { 'filter.price_level.min': '1', 'filter.price_level.max': '2' }
  if (value.includes('$10') && value.includes('$20')) return { 'filter.price_level.min': '2', 'filter.price_level.max': '3' }
  if (value.includes('$20') && value.includes('$50')) return { 'filter.price_level.min': '3', 'filter.price_level.max': '4' }
  if (value.includes('$50+')) return { 'filter.price_level.min': '4' }
  return {}
}

function hotelPrice(answer: string | undefined): Record<string, string> {
  const value = clean(answer).toLowerCase()
  // The current UI presents its nightly bands in dollars; Qloo documents
  // price_range as an integer range, so those numeric bounds are passed as-is.
  if (value.includes('under $50')) return { 'filter.price_range.max': '50' }
  if (value.includes('$50') && value.includes('$100')) return { 'filter.price_range.min': '50', 'filter.price_range.max': '100' }
  if (value.includes('$100') && value.includes('$200')) return { 'filter.price_range.min': '100', 'filter.price_range.max': '200' }
  if (value.includes('$200') && value.includes('$500')) return { 'filter.price_range.min': '200', 'filter.price_range.max': '500' }
  if (value.includes('$500+')) return { 'filter.price_range.min': '500' }
  return {}
}

export function mapAnswersToQloo(category: Category, answers: string[]): QlooPlan {
  if (category === 'movies') {
    const mood = usable(answers[0])
    const genre = usable(answers[1])
    return {
      tasteSignals: [mood, genre].filter((value): value is string => Boolean(value)),
      categoryFilters: genre ? [genre] : [],
      params: { 'filter.type': 'urn:entity:movie', take: '20', sort_by: 'affinity', 'feature.explainability': 'true' },
      // Viewing company and runtime have no documented matching Insights filters.
      appliedPreferences: [mood, genre].filter((value): value is string => Boolean(value)),
    }
  }

  if (category === 'restaurants') {
    const cuisine = usable(answers[0])
    const dietary = usable(answers[4])
    const location = usable(answers[3])
    const params: Record<string, string> = {
      'filter.type': 'urn:entity:place', take: '20', sort_by: 'affinity', 'feature.explainability': 'true',
      ...restaurantPrice(answers[1]),
    }
    if (location) params['filter.location.query'] = location
    return {
      tasteSignals: [cuisine, dietary].filter((value): value is string => Boolean(value)),
      // Cuisine is resolved to a Qloo tag ID first; no user text is sent as an ID.
      categoryFilters: ['restaurant'],
      params,
      // Occasion has no documented Insights filter; it remains in the chat history only.
      appliedPreferences: [cuisine, dietary, location].filter((value): value is string => Boolean(value)),
    }
  }

  const stayType = usable(answers[0])
  const requestedArea = usable(answers[2])
  const knownAreas = ['city center', 'near the beach', 'mountains & nature', 'countryside', 'near tourist attractions']
  const normalizedArea = clean(answers[2]).toLowerCase().replace(/\s*[🌆🏖️⛰️🌳📸].*$/u, '').trim()
  const isKnownArea = knownAreas.some((area) => normalizedArea.startsWith(area))
  const destination = requestedArea && !isKnownArea ? requestedArea : undefined
  const areaSignal = requestedArea && isKnownArea ? requestedArea : undefined
  const params: Record<string, string> = {
    'filter.type': 'urn:entity:place', take: '20', sort_by: 'affinity', 'feature.explainability': 'true',
    ...hotelPrice(answers[1]),
  }
  if (destination) params['filter.location.query'] = destination
  return {
    tasteSignals: [stayType, areaSignal].filter((value): value is string => Boolean(value)),
    categoryFilters: ['hotel'],
    params,
    // Area style is a taste/tag signal; destination is a documented locality filter.
    appliedPreferences: [stayType, destination, areaSignal].filter((value): value is string => Boolean(value)),
  }
}

export function genericPreferencePlan(category: Category, preferences?: string): QlooPlan {
  const terms = (preferences ?? '').split(/[,;]+/).map((term) => usable(term)).filter((term): term is string => Boolean(term)).slice(0, 5)
  return {
    tasteSignals: terms,
    categoryFilters: category === 'restaurants' ? ['restaurant'] : category === 'hotels' ? ['hotel'] : [],
    params: { 'filter.type': category === 'movies' ? 'urn:entity:movie' : 'urn:entity:place', take: '20', sort_by: 'affinity', 'feature.explainability': 'true' },
    appliedPreferences: terms,
  }
}
