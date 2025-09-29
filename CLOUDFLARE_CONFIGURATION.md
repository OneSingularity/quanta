# Cloudflare Configuration Guide

This document explains the required Cloudflare dashboard configuration and CI deployment setup for the Quanta project's dual architecture.

## Issue Description

The Quanta project uses a dual architecture:
- **Standalone Cloudflare Worker** (`quanta-stream-proxy`): Handles API endpoints and scheduled tasks
- **Cloudflare Pages** (`quanta-web`): Hosts the Next.js web application

Two main issues were resolved:
1. **Node.JS Compatibility Error**: Requires `nodejs_compat` flag configuration in dashboard
2. **Workers Build CI Failure**: CI was deploying wrong worker name due to naming conflicts

## Required Configuration

### Step 1: Access Cloudflare Dashboard
1. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account

### Step 2: Navigate to Pages Project
1. Select **Workers & Pages** from the sidebar
2. Select your **quanta-web** Pages project

### Step 3: Configure Compatibility Flags
1. Go to **Settings** > **Functions** > **Compatibility Flags**
2. Add the `nodejs_compat` flag to **both** environments:
   - **Production**: Add `nodejs_compat`
   - **Preview**: Add `nodejs_compat`

### Step 4: Verify Configuration
After configuring the compatibility flags:
1. The preview URLs should load without the "Node.JS Compatibility Error"
2. The Workers Build CI check should pass
3. All status indicators should show "Operational"

## Deployment Architecture

### Standalone Worker (quanta-stream-proxy)
- **Purpose**: API endpoints and scheduled tasks
- **Endpoints**: `/health`, `/version`, `/sse/ticks`, `/news/recent`, `/alerts`
- **Configuration**: `apps/worker/wrangler.toml` (includes `nodejs_compat`)
- **Deployment**: Separate worker service deployed via `cd apps/worker && pnpm deploy`
- **Production URL**: `https://quanta-stream-proxy.f00ba328036ba6fad81a8b90ce0dd676.workers.dev`

### Pages Functions (quanta-web)
- **Purpose**: Next.js web application hosting
- **Proxy Routes**: `/api/worker-proxy/*` routes proxy to the standalone worker
- **Configuration**: Requires dashboard configuration for `nodejs_compat`
- **Deployment**: Cloudflare Pages automatic deployment from git

## CI Deployment Process

The dual architecture requires careful CI configuration to prevent naming conflicts:

1. **Pages Deployment**: Automatically deploys from git repository as "quanta-web" via `.github/workflows/deploy.yml`
2. **Worker Deployment**: Deploys separately as "quanta-stream-proxy" using the configuration in `apps/worker/wrangler.toml` via `.github/workflows/deploy-worker.yml`

### GitHub Actions Workflows
- **`.github/workflows/deploy.yml`**: Deploys both Pages and Worker on main branch pushes
- **`.github/workflows/deploy-worker.yml`**: Worker-only deployment for manual triggers or worker-specific changes

### Worker Deployment Commands
```bash
# Local development
cd apps/worker && pnpm dev

# Production deployment
cd apps/worker && pnpm deploy

# Manual CI trigger
gh workflow run "Deploy Cloudflare Worker Only"
```

## Why Both Are Needed

1. **Standalone Worker**: Provides real-time data streaming, scheduled background tasks, and dedicated API endpoints
2. **Pages Functions**: Enables the Next.js app to use Node.js APIs (like Supabase client) in server-side functions
3. **Worker Proxy**: The Next.js app proxies requests to the standalone worker via `/api/worker-proxy/*` routes

## Troubleshooting

### Node.JS Compatibility Error
If you see the "Node.JS Compatibility Error":
1. Verify the `nodejs_compat` flag is set for both Production and Preview environments in dashboard
2. Redeploy the Pages project to apply the new compatibility settings

### Workers Build CI Failure
If the Workers Build CI fails with naming conflicts:
1. Ensure only one `wrangler.toml` file exists in `apps/worker/` directory
2. Verify the worker name is "quanta-stream-proxy" in `apps/worker/wrangler.toml`
3. Check that no root `wrangler.toml` file exists that could cause naming conflicts
4. Verify GitHub Actions workflows are properly configured:
   - `.github/workflows/deploy.yml` handles both deployments
   - `.github/workflows/deploy-worker.yml` handles worker-only deployments
5. Check that `CLOUDFLARE_API_TOKEN` secret is configured in repository settings

### Status Indicators Show "Down"
If status indicators show "Down" instead of "Operational":
1. Verify the standalone worker is deployed and accessible at its production URL
2. Check that `WORKER_URL` is correctly configured in `apps/web/next.config.js`
3. Test worker proxy endpoints: `/api/worker-proxy/health` and `/api/worker-proxy/version`

## Technical Details

- The `nodejs_compat` flag in `apps/worker/wrangler.toml` only applies to the standalone worker
- Pages Functions require separate compatibility flag configuration through the dashboard
- Worker proxy routes in Next.js handle CORS and content-type headers for cross-origin requests
- The dual architecture prevents vendor lock-in and provides better separation of concerns
