import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { AppError } from './errors.js'

export function validateBody<T>(schema: ZodType<T>) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body)
    if (!result.success) return next(new AppError(400, 'VALIDATION_ERROR', 'Request body is invalid.', result.error.flatten()))
    request.body = result.data
    return next()
  }
}
