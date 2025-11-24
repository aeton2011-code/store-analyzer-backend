# Store Analyzer Backend

Backend to analyze store pages using Puppeteer screenshot + Gemini AI.

## Endpoints

### GET /
Health check.

### POST /analyze
Body:
```json
{
  "url": "https://example.com"
}
