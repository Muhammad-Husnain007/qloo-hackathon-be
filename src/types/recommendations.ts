export const categories = ['movies', 'restaurants', 'hotels'] as const
export type Category = (typeof categories)[number]

export type Recommendation = {
  id: string
  title: string
  subtitle: string
  matchScore?: number
  rank?: number
  imageUrl?: string
  explanation: string
  tags: string[]
}

export type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatRequest = {
  category: Category
  answers: string[]
  conversationHistory: ChatHistoryMessage[]
}

export type ChatQuestionResponse = {
  type: 'question'
  category: Category
  question: string
  quickReplies: string[]
  progress: { answered: number; total: number }
}

export type ChatRecommendationsResponse = {
  type: 'recommendations'
  category: Category
  source: 'qloo' | 'mock'
  message: string
  recommendations: Recommendation[]
}

export type ChatResponse = ChatQuestionResponse | ChatRecommendationsResponse
