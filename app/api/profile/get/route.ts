export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import {
  const { auth, db } = await import("@/lib/firebase-admin");
 NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Decode Firebase token
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    // Load user from Firestore
    const snap = await db.collection("users").doc(uid).get();

    if (!snap.exists) {
      return NextResponse.json({}, { status: 200 }); // empty profile
    }

    return NextResponse.json(snap.data());
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}