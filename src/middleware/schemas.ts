import { z } from 'zod'
import { categories } from '../types/recommendations.js'

export const categoryParamSchema = z.object({ category: z.enum(categories) })

export const chatRequestSchema = z.object({
  category: z.enum(categories),
  answers: z.array(z.string().trim().min(1).max(300)).max(10),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(2000),
  })).max(50).default([]),
}).strict()

export const recommendationQuerySchema = z.object({
  preferences: z.string().max(500).optional(),
}).strict()
