# TasteMate AI backend

Express + TypeScript API for the TasteMate chatbot. It can return local, clearly labelled mock cards without credentials or make server-side requests to Qloo when a key is configured. The browser never receives the Qloo key.

## Setup

Requires Node.js 18.18 or newer.

```powershell
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Set `FRONTEND_ORIGIN` to the frontend origin if it differs from `http://localhost:5173`. The checked-in `.env.example` contains placeholders only. Never commit `.env`.

### Qloo mode

The default `QLOO_MODE=auto` runs deterministic local mock data when `QLOO_API_KEY` is empty, and automatically switches to Qloo when the key is added. The default base URL is the Qloo hackathon host. If the key's onboarding instructions specify a different host, set `QLOO_BASE_URL` to that documented host.

```dotenv
QLOO_MODE=auto
QLOO_API_KEY=your_qloo_key_here
QLOO_BASE_URL=https://hackathon.api.qloo.com
```

`QLOO_MODE=mock` always uses mock data. `QLOO_MODE=live` requires a key and returns a configuration error if it is missing. Qloo HTTP, authentication, quota, timeout, tag lookup, and malformed-response errors are surfaced; live failures never fall back to fake recommendations.

The recommendation flow makes two documented Qloo calls:

1. `GET /v2/tags?filter.query=...&take=10&feature.typo_tolerance=true` resolves user preferences. Only tag IDs actually returned by Qloo are used.
2. `GET /v2/insights` requests results with a documented `filter.type`, `signal.interests.tags`, `filter.tags`, location/price parameters where applicable, `take=20`, and `feature.explainability=true`.

The Qloo Hackathon Kit currently documents `@qloo/qloo-harness` (`qloo api`, `qloo exec`, and `qloo mcp`) as the supported surfaces for event-issued credentials. This backend uses the documented REST routes directly to keep `QLOO_BASE_URL` configurable as requested. If the issued credential is restricted to harness calls, the transport will need to be switched to the organizer-approved harness/gateway before live use.

Qloo results are checked against the documented response envelopes and required entity/tag fields before being returned. The official sample does not document a per-item affinity scalar, so live cards show Qloo's affinity sort order instead of fabricating a percentage score. If Qloo returns `properties.image.url`, the frontend uses that image. The local-only mock cards retain their synthetic percentages and identify them as mock values.

## Answer mapping

| Chat category | Qloo result type | Qloo taste signals | Qloo filters / answer handling |
| --- | --- | --- | --- |
| Movies | `urn:entity:movie` | Resolved mood and genre tags in `signal.interests.tags` | Resolved genre tag in `filter.tags`. Runtime and who is watching have no documented matching Insights filter, so they are not sent as unsupported fields. |
| Restaurants | `urn:entity:place` | Resolved craving and dietary tags | A returned restaurant tag in `filter.tags`; typed city/area in `filter.location.query`; budget mapped to documented `filter.price_level.min/max` values. Occasion is not a documented Insights filter and is not sent. |
| Hotels | `urn:entity:place` | Resolved stay-style and (for known area choices) area-style tags | A returned hotel tag in `filter.tags`; a typed destination in `filter.location.query`; nightly budget mapped to documented `filter.price_range.min/max` integer bounds. |

Qloo documents `price_level` as restaurant price levels 1–4; its mapping from the UI dollar bands is coarse. Hotel price range uses the dollar bounds shown by the UI. Qloo's public reference does not define a currency-conversion rule, so the app assumes the UI's dollar values match the Qloo account's expected units. No undocumented Qloo parameters are sent. Unsupported answers are retained in chatbot history but omitted from Qloo query parameters.

## API

### `GET /api/health`

Returns service status.

### `GET /api/recommendations`

Lists supported categories.

### `GET /api/recommendations/:category`

Returns recommendations for `movies`, `restaurants`, or `hotels`. Optional `preferences` is used to resolve taste tags in live mode. The response includes `source: "qloo"` or `source: "mock"`.

```http
GET /api/recommendations/movies?preferences=Comedy,feel-good
```

### `POST /api/chat`

Send the category, all answers so far, and conversation history. Until the category's questions are answered, the API returns the next question. The final answer triggers Qloo (or labeled local mock mode).

```json
{
  "category": "movies",
  "answers": ["Happy", "Comedy", "Friends", "90–120 minutes"],
  "conversationHistory": [
    { "role": "assistant", "content": "What's your current mood?" },
    { "role": "user", "content": "Happy" }
  ]
}
```

Example recommendation response:

```json
{
  "data": {
    "type": "recommendations",
    "category": "movies",
    "source": "qloo",
    "message": "Here are Qloo recommendations ranked by affinity to your selected taste signals. Qloo affinity is a relative score.",
    "recommendations": [
      {
        "id": "<Qloo entity ID>",
        "title": "<name returned by Qloo>",
        "subtitle": "<Qloo subtype or entity type>",
        "rank": 1,
        "imageUrl": "<Qloo properties.image.url, when returned>",
        "explanation": "Qloo returned this item in its affinity-ranked results for your selected taste signals.",
        "tags": ["<tag name returned by Qloo>"]
      }
    ]
  }
}
```

With no key and `QLOO_MODE=auto`, the final response uses `source: "mock"` and a message clearly identifies the cards as local mock results. These cards are for local development only; no fake Qloo API response is used.

## Structure

```text
src/
  config/       environment configuration
  controllers/  HTTP request handlers
  data/         chatbot questions and local mock cards
  middleware/   validation and centralized errors
  routes/       REST route definitions
  services/     recommendations and Qloo client/mapping
  types/        API request and response types
```

## Official Qloo references

- [Qloo API overview](https://github.com/qloo/docs-public/blob/main/reference/api-overview.md)
- [Insights API deep dive and parameter reference](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md)
- [Tags Search API](https://github.com/qloo/docs-public/blob/main/reference/get-tags.md)
- [Entity Search API](https://github.com/qloo/docs-public/blob/main/reference/get-search.md)
- [Qloo Hackathon Kit](https://github.com/qloo/qloo-hackathon-kit)
