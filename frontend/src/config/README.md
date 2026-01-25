# Environment Configuration

This directory contains the centralized environment configuration for the frontend application.

## Files

- `env.config.ts` - Main configuration file that reads environment variables

## Environment Variables

All environment variables are prefixed with `VITE_` to be accessible in the browser.

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENV` | Current environment (development/staging/production) | `development` |
| `VITE_API_URL` | Backend API base URL | `/api` |
| `VITE_APP_NAME` | Application display name | `Studium AI` |

## Environment Files

The application supports multiple environment files:

- `.env.development` - Development environment settings (used by default)
- `.env.staging` - Staging environment settings
- `.env.production` - Production environment settings
- `.env.local` - Local overrides (not committed to git)

## Usage

Import the config in your components/utilities:

```typescript
import config from '@/config/env.config';

// Access configuration values
const apiUrl = config.API_URL;
const isProduction = config.IS_PRODUCTION;
```

## Local Development

1. Copy `.env.example` to `.env.local`
2. Update values as needed for your local setup
3. `.env.local` takes precedence over other env files

## Build Commands

Vite automatically loads the appropriate env file based on the mode:

```bash
# Development (uses .env.development)
npm run dev

# Production (uses .env.production)
npm run build

# Custom environment
vite build --mode staging  # Uses .env.staging
```

## Adding New Variables

1. Add the variable to the appropriate `.env.*` files
2. Update the `EnvironmentConfig` interface in `env.config.ts`
3. Add the variable to the config object
4. Update this README with the new variable

## Security Notes

- Never commit sensitive data to `.env` files
- Use `.env.local` for local secrets
- `.env.local` is gitignored by default
- Only `VITE_` prefixed variables are exposed to the client
