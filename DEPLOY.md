# SmartWerk deploy notes

## Before deploy

1. Copy `.env.example` into the target environment.
2. Set `NEXT_PUBLIC_URL` to your real domain.
3. Add Stripe webhook endpoint: `/api/stripe/webhook`.
4. Make sure Firebase service-account keys are stored only as server env vars.

## Recommended checks

```bash
npm install
npm run check
npm run build
```
