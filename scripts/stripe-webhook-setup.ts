#!/usr/bin/env -S node --enable-source-maps
/*
Usage:
  1) With Stripe CLI (recommended for local dev):
     - Requires: `stripe` CLI installed and `stripe login` done.
     - Run: `pnpm stripe:webhook -- --forward-to http://localhost:3000/api/webhooks/stripe`
       This will print the signing secret; this script will capture and write it to `.env.local`.

  2) With existing webhook endpoint ID (for remote envs):
     - Set env `STRIPE_SECRET_KEY` and provide `--endpoint-webhook-id wh_...`
     - Run: `pnpm stripe:webhook -- --endpoint-webhook-id wh_123`
*/

import { spawn } from "node:child_process";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { EOL } from "node:os";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..");
const appRoot = path.resolve(projectRoot, "apps/web");
const envLocalPath = path.join(projectRoot, ".env.local");

const args = process.argv.slice(2);
const endpointIdArg = args.find((a) => a.startsWith("--endpoint-webhook-id"));
const endpointId = endpointIdArg?.split("=")[1];

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

async function fetchSecretFromCli() {
  const forwardToArg = args.find((a) => a.startsWith("--forward-to"));
  const forwardTo = forwardToArg?.split("=")[1] ?? "http://localhost:3000/api/webhooks/stripe";
  console.log(`Starting Stripe CLI listen with forward-to=${forwardTo}`);
  const child = spawn("stripe", ["listen", "--forward-to", forwardTo], { stdio: ["ignore", "pipe", "pipe"] });
  const rl = createInterface({ input: child.stdout });
  rl.on("line", (line) => {
    const m = line.match(/\bwhsec_[a-zA-Z0-9]+\b/);
    if (m) {
      const secret = m[0];
      upsertEnv("STRIPE_WEBHOOK_SECRET", secret);
      console.log("Stripe webhook secret captured.");
      rl.close();
      child.kill();
    }
  });
  child.stderr.on("data", (d) => process.stderr.write(d));
}

async function fetchSecretFromApi() {
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) {
    console.error("STRIPE_SECRET_KEY is required to fetch webhook secret via API.");
    process.exit(1);
  }
  if (!endpointId) {
    console.error("--endpoint-webhook-id is required when using API mode.");
    process.exit(1);
  }
  const res = await fetch(`https://api.stripe.com/v1/webhook_endpoints/${endpointId}/secret`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sk}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to fetch secret: ${res.status} ${text}`);
    process.exit(1);
  }
  const data = (await res.json()) as { secret: string };
  if (!data?.secret) {
    console.error("No secret returned by Stripe API.");
    process.exit(1);
  }
  upsertEnv("STRIPE_WEBHOOK_SECRET", data.secret);
}

(async () => {
  if (endpointId) {
    await fetchSecretFromApi();
  } else {
    await fetchSecretFromCli();
  }
})();
