# Fix Cloudflare Pages Production Deployment

This PR fixes the production deployment issue where the Quanta app shows "Down" status indicators despite successful build process.

## Root Cause
The production deployment on Cloudflare Pages was building from the main branch, which lacked critical configuration for Cloudflare Workers runtime compatibility.

## Key Changes

### 1. Add nodejs_compat flag to wrangler.toml
- Added `compatibility_flags = ["nodejs_compat"]` to enable Node.js API compatibility
- This is essential for Cloudflare Workers to properly handle Node.js APIs used by Supabase client

### 2. Simplify worker implementation
- Removed unnecessary CORS handling code from worker
- Simplified response handling using modern Response.json() API
- Cleaner, more maintainable code

### 3. Fix Next.js configuration
- Removed deprecated `appDir` configuration from next.config.js
- Moved viewport configuration to proper export in layout.tsx
- Improved worker proxy content-type handling

## Testing
- ✅ Local development tested and working
- ✅ All status indicators show "Operational" in local environment
- ✅ Health and version endpoints respond correctly

## Production Impact
After merge, the Cloudflare Pages deployment should rebuild and show "Operational" status indicators instead of "Down".

## Link to Devin run
https://app.devin.ai/sessions/cd642af8cc1d43cbb2fc6a6138a6c9dd

## Requested by
@OneSingularity
