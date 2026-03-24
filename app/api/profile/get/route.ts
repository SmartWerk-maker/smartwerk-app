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
      return NextResponse.json({}, { status: 200 });
    }

    return NextResponse.json(snap.data() ?? {});
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
