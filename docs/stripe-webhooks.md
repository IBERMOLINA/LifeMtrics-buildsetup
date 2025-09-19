# Stripe Webhooks: Local and Remote Setup

## Local dev (recommended)
- Install Stripe CLI and login: `stripe login`
- Start a listener that forwards to Next route and auto-captures the signing secret:
```bash
pnpm stripe:webhook -- --forward-to http://localhost:3000/api/webhooks/stripe
```
- The script will parse the `whsec_...` secret and write `STRIPE_WEBHOOK_SECRET` into `.env.local`.

## Existing endpoint (API fetch)
- If you already have a webhook endpoint ID (`wh_...`), fetch its secret:
```bash
export STRIPE_SECRET_KEY=sk_test_...
pnpm stripe:webhook:api -- --endpoint-webhook-id wh_123
```

## Create new endpoint (API)
- Create a new endpoint pointing to your deployed app:
```bash
export STRIPE_SECRET_KEY=sk_live_...
pnpm stripe:webhook:create -- --url https://your.app/api/webhooks/stripe --description "Prod webhook"
```
- This writes `STRIPE_WEBHOOK_SECRET` (if returned) and `STRIPE_WEBHOOK_ENDPOINT_ID` to `.env.local`.

## Environment variables
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_ENDPOINT_ID` (optional)

## Verify
- Run dev: `pnpm --filter web dev`
- Trigger a test event: `stripe trigger payment_intent.succeeded`
- Route: `apps/web/app/api/webhooks/stripe/route.ts`
