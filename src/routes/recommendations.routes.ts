import { Router } from 'express'
import { listRecommendations, recommendationCategories } from '../controllers/recommendations.controller.js'

const router = Router()
router.get('/', recommendationCategories)
router.get('/:category', listRecommendations)

export default router
