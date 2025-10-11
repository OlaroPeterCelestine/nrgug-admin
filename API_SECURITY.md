# API Security Configuration

## Overview
This document describes how the API URLs are hidden and secured in the admin panel.

## Architecture

### Client-Side (Browser)
- **API Base URL**: `/api/proxy` (relative URL, no external API exposed)
- **Configuration**: `src/lib/client-api.ts`
- **Usage**: All client-side API calls go through the proxy

### Server-Side (Next.js API Routes)
- **API Base URL**: `process.env.BACKEND_URL` (environment variable)
- **Configuration**: `src/lib/server-api.ts`
- **Proxy Route**: `src/app/api/proxy/[...path]/route.ts`

### Environment Variables
- **BACKEND_URL**: The actual API URL (hidden from client)
- **NEXT_PUBLIC_API_URL**: Removed (no longer needed)

## Security Benefits

1. **Hidden API Endpoints**: The real API URL is never exposed to the client
2. **Environment-Based**: API URL is configurable via environment variables
3. **Proxy Layer**: All requests go through Next.js API routes
4. **CORS Handling**: Proper CORS headers are set by the proxy
5. **Error Handling**: Centralized error handling in the proxy

## File Structure

```
admin/
├── src/
│   ├── lib/
│   │   ├── api.ts              # Main API client (uses proxy)
│   │   ├── client-api.ts       # Client-side configuration
│   │   └── server-api.ts       # Server-side configuration
│   └── app/
│       └── api/
│           └── proxy/
│               └── [...path]/
│                   └── route.ts # Proxy implementation
├── vercel.json                 # Environment configuration
└── API_SECURITY.md            # This documentation
```

## Deployment

The API URL is hidden through:
1. Environment variables in Vercel
2. Next.js API routes as proxy
3. Client-side configuration using relative URLs

## Testing

To test the proxy:
```bash
# This will go through the proxy
curl https://your-admin-domain.vercel.app/api/proxy/news

# This will be blocked (direct API access)
curl https://nrgug-api-production.up.railway.app/api/news
```

