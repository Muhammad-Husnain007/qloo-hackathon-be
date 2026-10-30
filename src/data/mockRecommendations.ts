import type { Category, Recommendation } from '../types/recommendations.js'

export const mockRecommendations: Record<Category, Recommendation[]> = {
  movies: [
    { id: 'grand-budapest-hotel', title: 'The Grand Budapest Hotel', subtitle: '2014 · Comedy, Adventure', matchScore: 98, explanation: 'Playful, beautifully made, and just the right kind of escape for your mood.', tags: ['Whimsical', 'Critically loved'] },
    { id: 'little-miss-sunshine', title: 'Little Miss Sunshine', subtitle: '2006 · Comedy, Drama', matchScore: 94, explanation: 'A warm-hearted road trip with characters you’ll want to keep thinking about.', tags: ['Feel-good', 'Indie favorite'] },
    { id: 'about-time', title: 'About Time', subtitle: '2013 · Romance, Drama', matchScore: 91, explanation: 'A quietly lovely story that makes an ordinary evening feel special.', tags: ['Thoughtful', 'Easy watch'] },
  ],
  restaurants: [
    { id: 'greenhouse-table', title: 'The Greenhouse Table', subtitle: 'Modern seasonal · $$', matchScore: 98, explanation: 'A relaxed, produce-led menu that feels thoughtful without trying too hard.', tags: ['Seasonal menu', 'Relaxed'] },
    { id: 'olive-and-ember', title: 'Olive & Ember', subtitle: 'Mediterranean · $$', matchScore: 95, explanation: 'Warm lighting, shareable plates, and an atmosphere that invites you to linger.', tags: ['Date night', 'Shareable plates'] },
    { id: 'juniper-room', title: 'Juniper Room', subtitle: 'New American · $$$', matchScore: 91, explanation: 'A creative neighborhood spot with fresh, satisfying options.', tags: ['Local favorite', 'Creative'] },
  ],
  hotels: [
    { id: 'casa-solana', title: 'Casa Solana', subtitle: 'Boutique hotel · Coastal', matchScore: 98, explanation: 'Sunlit rooms and an unhurried pace make switching off feel effortless.', tags: ['Coastal', 'Boutique'] },
    { id: 'alder-house', title: 'The Alder House', subtitle: 'Design hotel · City center', matchScore: 95, explanation: 'A beautiful base in the heart of it all, with considered details.', tags: ['Design-led', 'Central'] },
    { id: 'stillwater-lodge', title: 'Stillwater Lodge', subtitle: 'Country retreat · Lakeside', matchScore: 92, explanation: 'Quiet mornings, fresh air, and space to do as little as you like.', tags: ['Lakeside', 'Peaceful'] },
  ],
}

export const categoryQuestions: Record<Category, { question: string; quickReplies: string[] }[]> = {
  movies: [
    { question: "What's your current mood?", quickReplies: ['Happy 😊', 'Sad 😔', 'Excited 🔥', 'Relaxed 😌', 'Want to feel inspired 💪'] },
    { question: 'Which genres do you prefer?', quickReplies: ['Action', 'Comedy', 'Romance', 'Thriller', 'Horror', 'Sci-Fi', 'Drama'] },
    { question: 'Who are you watching with?', quickReplies: ['Alone', 'Partner ❤️', 'Friends 👫', 'Family 👨‍👩‍👧‍👦'] },
    { question: 'How much time do you have?', quickReplies: ['Under 90 minutes', '90–120 minutes', 'More than 2 hours'] },
  ],
  restaurants: [
    { question: 'What type of food are you craving?', quickReplies: ['Desi Food 🍛', 'Fast Food 🍔', 'Chinese Food 🥡', 'BBQ & Grilled Food 🍖', 'Italian Food 🍕', 'Seafood 🦐', 'Middle Eastern Food 🥙', 'Street Food 🌮', 'Healthy Food 🥗', 'Desserts & Sweets 🍰', 'Anything — Surprise Me! ✨'] },
    { question: "What's your budget per person?", quickReplies: ['Under $5', '$5–$10', '$10–$20', '$20–$50', '$50+', 'No budget limit 💳'] },
    { question: "What's the occasion?", quickReplies: ['Casual dining', 'Date night ❤️', 'Family dinner 👨‍👩‍👧‍👦', 'Friends gathering 👫', 'Birthday celebration 🎂', 'Business meeting 💼'] },
    { question: 'Which city or area are you looking in?', quickReplies: [] },
    { question: 'Do you have any dietary preferences? (Optional)', quickReplies: ['Vegetarian', 'Vegan', 'Halal', 'High-protein', 'No specific preference', 'Skip — optional'] },
  ],
  hotels: [
    { question: 'What type of stay are you looking for?', quickReplies: ['Luxury Hotel ✨', 'Budget Hotel 💰', 'Resort & Spa 🌴', 'Beachfront Hotel 🏖️', 'Boutique Hotel 🏡', 'Business Hotel 💼', 'Family-Friendly Hotel 👨‍👩‍👧‍👦', 'Romantic Getaway ❤️', 'Cabin & Nature Stay 🌲', 'Surprise Me! 🎯'] },
    { question: "What's your budget per night?", quickReplies: ['Under $50', '$50–$100', '$100–$200', '$200–$500', '$500+', 'No Budget Limit'] },
    { question: 'Where would you like to stay?', quickReplies: ['City Center 🌆', 'Near the Beach 🏖️', 'Mountains & Nature ⛰️', 'Countryside 🌳', 'Near Tourist Attractions 📸', 'Enter My Destination'] },
  ],
}
