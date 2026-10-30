import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import chatRoutes from './routes/chat.routes.js'
import recommendationRoutes from './routes/recommendations.routes.js'
import { AppError, errorHandler, notFoundHandler } from './middleware/errors.js'

const app = express()

app.disable('x-powered-by')
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true)
    return callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'This origin is not allowed by the API.'))
  },
}))
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', (_request, response) => response.json({ data: { status: 'ok' } }))
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/chat', chatRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
