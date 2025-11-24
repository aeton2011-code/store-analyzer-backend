# Sadeem Puppeteer Backend (Render)

This backend provides:
- Full Page Screenshot using Puppeteer
- JSON response with Base64 image

## Endpoints

### GET /
Health check.

### POST /screenshot
Body:
```json
{
  "url": "https://example.com"
}
