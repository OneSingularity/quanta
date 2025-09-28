# Cloudflare Configuration Guide

This document explains the required Cloudflare dashboard configuration to resolve the "Node.JS Compatibility Error" for the Quanta project.

## Issue Description

The Quanta project uses a dual architecture:
- **Standalone Cloudflare Worker** (`quanta-stream-proxy`): Handles API endpoints and scheduled tasks
- **Cloudflare Pages** (`quanta-web`): Hosts the Next.js web application

The "Node.JS Compatibility Error" occurs because Cloudflare Pages Functions require the `nodejs_compat` compatibility flag to be configured at the project level through the Cloudflare dashboard.

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

## Architecture Overview

### Standalone Worker (quanta-stream-proxy)
- **Purpose**: API endpoints and scheduled tasks
- **Endpoints**: `/health`, `/version`, `/sse/ticks`, `/news/recent`, `/alerts`
- **Configuration**: `apps/worker/wrangler.toml` (already includes `nodejs_compat`)
- **Deployment**: Separate worker service

### Pages Functions (quanta-web)
- **Purpose**: Next.js web application hosting
- **Proxy Routes**: `/api/worker-proxy/*` routes proxy to the standalone worker
- **Configuration**: Requires dashboard configuration for `nodejs_compat`
- **Deployment**: Cloudflare Pages

## Why Both Are Needed

1. **Standalone Worker**: Provides real-time data streaming, scheduled background tasks, and dedicated API endpoints
2. **Pages Functions**: Enables the Next.js app to use Node.js APIs (like Supabase client) in server-side functions

## Troubleshooting

If you still see the "Node.JS Compatibility Error" after configuration:
1. Verify the `nodejs_compat` flag is set for both Production and Preview environments
2. Redeploy the Pages project to apply the new compatibility settings
3. Check that the worker proxy routes in the Next.js app are correctly configured

## Technical Details

- The `nodejs_compat` flag in `apps/worker/wrangler.toml` only applies to the standalone worker
- Pages Functions require separate compatibility flag configuration through the dashboard
- This is documented in the [Cloudflare Pages Functions documentation](https://developers.cloudflare.com/pages/functions/get-started/#runtime-features)
