import type { RequestHandler } from 'express'
import { getChatResponse } from '../services/recommendations.service.js'
import type { ChatRequest } from '../types/recommendations.js'

export const chat: RequestHandler = async (request, response, next) => {
  try {
    const body = request.body as ChatRequest
    const result = await getChatResponse(body.category, body.answers, body.conversationHistory)
    response.json({ data: result })
  } catch (error) {
    next(error)
  }
}
