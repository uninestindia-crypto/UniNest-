import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

async function verifySignature(body: string, headerSig: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expected = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return expected === headerSig;
}

Deno.serve(async (req) => {
    const razorpaySig = req.headers.get("x-razorpay-signature");
    const body = await req.text();

    if (!razorpaySig) return new Response("Missing signature", { status: 400 });

    const valid = await verifySignature(body, razorpaySig);
    if (!valid) return new Response("Invalid signature", { status: 400 });

    const event = JSON.parse(body);
    console.log("✅ Razorpay Event:", event.event);

    // handle event.payload.payment.entity etc.
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
