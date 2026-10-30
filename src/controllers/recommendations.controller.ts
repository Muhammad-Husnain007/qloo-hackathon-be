import type { RequestHandler } from 'express'
import { z } from 'zod'
import { AppError } from '../middleware/errors.js'
import { categoryParamSchema, recommendationQuerySchema } from '../middleware/schemas.js'
import { getRecommendations } from '../services/recommendations.service.js'

export const listRecommendations: RequestHandler = async (request, response, next) => {
  const params = categoryParamSchema.safeParse(request.params)
  if (!params.success) return next(new AppError(404, 'CATEGORY_NOT_FOUND', 'Choose movies, restaurants, or hotels.'))

  const query = recommendationQuerySchema.safeParse(request.query)
  if (!query.success) return next(new AppError(400, 'VALIDATION_ERROR', 'Query parameters are invalid.', query.error.flatten()))

  try {
    const result = await getRecommendations(params.data.category, query.data.preferences)
    response.json({ data: result })
  } catch (error) {
    next(error)
  }
}

export const recommendationCategories: RequestHandler = (_request, response) => {
  response.json({ data: { categories: z.enum(['movies', 'restaurants', 'hotels']).options } })
}
