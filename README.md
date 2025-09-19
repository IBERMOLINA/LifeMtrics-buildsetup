# LifeMtrics Monorepo

Monorepo with Next.js web app, shared UI, config, and SDK.

## Structure
- apps/web – Next.js 15 (App Router) + Tailwind
- packages/ui – shared UI components (muted theme)
- packages/config – shared ESLint/TS/Prettier
- packages/sdk – entitlements helpers
- infra – deploy/config (add vercel.json later)

## Dev
```sh
corepack enable
pnpm install
pnpm dev
```

## License
MIT# LifeMtrics-buildsetup
automation for app building
