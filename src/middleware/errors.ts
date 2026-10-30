import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  constructor(public statusCode: number, public code: string, message: string, public details?: unknown) {
    super(message)
    this.name = 'AppError'
  }
}

export function notFoundHandler(request: Request, _response: Response, next: NextFunction) {
  next(new AppError(404, 'NOT_FOUND', `Route ${request.method} ${request.path} was not found.`))
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } })
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } })
    return
  }

  console.error('Unhandled request error:', error)
  response.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' } })
}
