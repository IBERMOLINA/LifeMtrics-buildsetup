import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-06-20",
});
export async function POST(req) {
    const sig = req.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !secret) {
        return NextResponse.json({ ok: true }, { status: 200 });
    }
    const body = await req.text();
    try {
        const event = await stripe.webhooks.constructEventAsync(body, sig, secret);
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
            case "invoice.payment_succeeded":
            case "invoice.payment_failed":
                // TODO: handle subscription lifecycle
                break;
            default:
                break;
        }
        return NextResponse.json({ received: true }, { status: 200 });
    }
    catch (err) {
        return new NextResponse(`Webhook Error: ${err?.message || "unknown"}`, { status: 400 });
    }
}
export async function POST(req) {
    try {
        // TODO: verify signature using STRIPE_WEBHOOK_SECRET and process events
        return new Response("ok", { status: 200 });
    }
    catch (err) {
        return new Response("error", { status: 400 });
    }
}
