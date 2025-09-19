#!/usr/bin/env -S node --enable-source-maps
/*
Creates a webhook endpoint via Stripe API and writes STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_ENDPOINT_ID to .env.local.

Usage:
  STRIPE_SECRET_KEY=sk_live_... pnpm stripe:webhook:create -- --url https://your.app/api/webhooks/stripe --description "Prod webhook"

Options:
  --url <url>            Required. The webhook endpoint URL.
  --events <csv>         Optional. Comma-separated list of events. Default: invoice.payment_succeeded,invoice.payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted
  --description <text>   Optional. Description for the endpoint.
*/

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { EOL } from "node:os";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..");
const envLocalPath = path.join(projectRoot, ".env.local");

function upsertEnv(key: string, value: string) {
  let content = existsSync(envLocalPath) ? readFileSync(envLocalPath, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    if (content && !content.endsWith(EOL)) content += EOL;
    content += `${key}=${value}` + EOL;
  }
  writeFileSync(envLocalPath, content, "utf8");
  console.log(`Wrote ${key} to ${envLocalPath}`);
}

const sk = process.env.STRIPE_SECRET_KEY;
if (!sk) {
  console.error("STRIPE_SECRET_KEY is required.");
  process.exit(1);
}

const args = process.argv.slice(2);
function getArg(name: string) {
  const a = args.find((x) => x === name || x.startsWith(name + "="));
  if (!a) return undefined;
  const [, value] = a.split("=");
  return value ?? undefined;
}

const url = getArg("--url");
if (!url) {
  console.error("--url is required");
  process.exit(1);
}
const description = getArg("--description") ?? "Webhook created via script";
const eventsCsv = getArg("--events") ?? [
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
].join(",");

const body = new URLSearchParams({
  url,
  description,
});
for (const ev of eventsCsv.split(",")) {
  body.append("enabled_events[]", ev.trim());
}

(async () => {
  const res = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sk}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to create webhook endpoint: ${res.status} ${text}`);
    process.exit(1);
  }
  const data = (await res.json()) as { id: string; secret?: string };
  if (!data?.id) {
    console.error("API did not return endpoint id.");
    process.exit(1);
  }
  if (data.secret) {
    upsertEnv("STRIPE_WEBHOOK_SECRET", data.secret);
  }
  upsertEnv("STRIPE_WEBHOOK_ENDPOINT_ID", data.id);
})();
