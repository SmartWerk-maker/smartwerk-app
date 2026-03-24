import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { getAdminAuth, getAdminDb } = await import("@/lib/firebase-admin");
    const auth = getAdminAuth();
    const db = getAdminDb();

    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) {
      return NextResponse.json({ plan: "FREE" });
    }

    const data = snap.data() || {};
    let plan = data.plan || "FREE";
    const sub = data.subscription;

    if (sub?.status === "active") plan = "PRO";
    else if (sub?.status === "trialing") plan = "TRIAL";
    else if (sub?.status === "canceled") plan = "FREE";

    return NextResponse.json({
      plan,
      subscription: data.subscription || null,
    });
  } catch (err) {
    console.error("Subscription API error:", err);
    return NextResponse.json(
      { error: "Could not load subscription" },
      { status: 500 }
    );
  }
}
