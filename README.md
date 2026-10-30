# TasteMate AI — Backend

TasteMate AI is an AI-powered personalized recommendation platform that helps users discover movies, restaurants, and hotels based on their interests, preferences, and budget.

This repository contains the backend API, built with **Node.js, Express.js, and TypeScript**. It manages chatbot conversations, processes user preferences, integrates with Qloo Taste Intelligence, and delivers personalized recommendations to the frontend.

## Features

- Personalized movie, restaurant, and hotel recommendations.
- Interactive chatbot with category-specific questions.
- Qloo Taste Intelligence integration.
- Local mock recommendations for development.
- Secure server-side API key management.
- Request validation and error handling.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Qloo API
- REST API

## Run Locally

**Prerequisites:** Node.js and npm.

**1. Clone the repository**

```bash
git clone https://github.com/Muhammad-Husnain007/qloo-hackathon-be.git
cd qloo-hackathon-be
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file by copying `.env.example` and configure the required variables.

**4. Start the development server**

```bash
npm run dev
```

**5. Test the API**

Open the following URL in your browser:

```text
http://localhost:5000/api/health
```

Your backend is now running locally.

**Note:** Add your Qloo API key to `.env` to enable live recommendations. Without a key, use mock mode if enabled.

Never commit your `.env` file or expose your API credentials.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Developed by Muhammad Husnain**