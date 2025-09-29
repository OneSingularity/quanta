# Fix Cloudflare Production Deployment - Dual Architecture Configuration

This PR fixes the production deployment issue where the Quanta app shows "Down" status indicators and resolves the Workers Build CI failure by properly configuring the dual architecture of standalone Cloudflare Worker and Pages deployment.

## Root Cause
The project uses a dual architecture with both a standalone Cloudflare Worker and Cloudflare Pages deployment. The issues were caused by:
1. Configuration conflicts between the two deployment types
2. Missing nodejs_compat configuration for Cloudflare Pages Functions
3. Improper handling of the dual architecture setup

## Architecture Overview

### Standalone Cloudflare Worker (`quanta-stream-proxy`)
- **Purpose**: API endpoints and scheduled background tasks
- **Endpoints**: `/health`, `/version`, `/sse/ticks`, `/news/recent`, `/alerts`
- **Configuration**: `apps/worker/wrangler.toml` with `nodejs_compat` flag
- **Deployment**: Separate worker service

### Cloudflare Pages (`quanta-web`)
- **Purpose**: Next.js web application hosting
- **Proxy Routes**: `/api/worker-proxy/*` routes proxy requests to the standalone worker
- **Configuration**: Requires dashboard configuration for `nodejs_compat`
- **Deployment**: Cloudflare Pages with Functions

## Key Changes

### 1. Add nodejs_compat flag to worker configuration
- Added `compatibility_flags = ["nodejs_compat"]` to `apps/worker/wrangler.toml`
- Essential for Cloudflare Workers to handle Node.js APIs used by Supabase client

### 2. Fix CI deployment configuration
- Added `.github/workflows/deploy.yml` for coordinated dual architecture deployment
- Added `.github/workflows/deploy-worker.yml` for worker-only deployments
- Prevents naming conflicts between Pages ("quanta-web") and Worker ("quanta-stream-proxy")
- Ensures standalone worker gets deployed to production

### 3. Configure production worker URL
- Added `WORKER_URL` configuration in `apps/web/next.config.js`
- Points to production worker URL: `https://quanta-stream-proxy.f00ba328036ba6fad81a8b90ce0dd676.workers.dev`
- Enables worker proxy endpoints to function in production

### 4. Remove configuration conflicts
- Removed conflicting root `wrangler.toml` that was causing Workers Build failures
- Maintained separate configurations for worker and Pages deployments

### 5. Add comprehensive documentation
- Created `CLOUDFLARE_CONFIGURATION.md` with required dashboard setup steps
- Documents the dual architecture, CI deployment process, and troubleshooting steps

## Required Manual Configuration

**IMPORTANT**: To resolve the "Node.JS Compatibility Error", you must configure the `nodejs_compat` flag in the Cloudflare dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > Workers & Pages > quanta-web
2. Navigate to Settings > Functions > Compatibility Flags
3. Add `nodejs_compat` to both Production and Preview environments

See `CLOUDFLARE_CONFIGURATION.md` for detailed instructions.

## Testing
- ✅ Local development tested and working with dual architecture
- ✅ All status indicators show "Operational" in local environment
- ✅ Worker endpoints accessible both directly and through proxy
- ✅ Health and version endpoints respond correctly

## Production Impact
After merge and dashboard configuration:
- Cloudflare Pages deployment will show "Operational" status indicators
- Workers Build CI check will pass
- Both architectures will work together without conflicts

## Link to Devin run
https://app.devin.ai/sessions/cd642af8cc1d43cbb2fc6a6138a6c9dd

## Requested by
@OneSingularity
