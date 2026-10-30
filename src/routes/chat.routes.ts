import { Router } from 'express'
import { chat } from '../controllers/chat.controller.js'
import { validateBody } from '../middleware/validate.js'
import { chatRequestSchema } from '../middleware/schemas.js'

const router = Router()
router.post('/', validateBody(chatRequestSchema), chat)

export default router
