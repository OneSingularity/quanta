.PHONY: help install build dev test lint typecheck clean deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	pnpm install

build: ## Build all packages
	pnpm -w build

dev: ## Start development servers
	@echo "Starting development environment..."
	@echo "This will start:"
	@echo "  - Next.js web app on http://localhost:3000"
	@echo "  - Cloudflare Worker on http://localhost:8787"
	@echo ""
	pnpm -w dev

test: ## Run all tests
	pnpm -w test

lint: ## Run linting
	pnpm -w lint

typecheck: ## Run TypeScript type checking
	pnpm -w typecheck

clean: ## Clean build artifacts and node_modules
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf packages/*/dist
	pnpm store prune

deploy: ## Deploy to production
	@echo "Deploying to production..."
	@echo "1. Building all packages..."
	pnpm -w build
	@echo "2. Deploying Cloudflare Worker..."
	cd apps/worker && pnpm deploy
	@echo "3. Deploying Next.js app to Cloudflare Pages..."
	cd apps/web && pnpm build && wrangler pages deploy .next
	@echo "Deployment complete!"

# Development helpers
dev-worker: ## Start only the Cloudflare Worker
	cd apps/worker && pnpm dev

dev-web: ## Start only the Next.js web app
	cd apps/web && pnpm dev

# Database helpers
db-migrate: ## Apply database migrations
	@echo "Database migrations should be applied manually to Supabase"
	@echo "See the SQL schema in the project documentation"

# Utility commands
logs-worker: ## View Cloudflare Worker logs
	cd apps/worker && wrangler tail

status: ## Check system status
	@echo "Checking system status..."
	@curl -s http://localhost:8787/health || echo "Worker not running"
	@curl -s http://localhost:3000/api/health || echo "Web app not running"
