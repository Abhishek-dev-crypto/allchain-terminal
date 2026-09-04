import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";

const ADMIN_EMAIL = "abhiii31@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const idToken = authHeader.replace("Bearer ", "").trim();

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const uid = body?.uid;
    const requestId = body?.requestId;

    if (!uid || !requestId) {
      return NextResponse.json(
        { error: "uid and requestId are required" },
        { status: 400 }
      );
    }

    const db = admin.firestore();

    // Grant Premium entitlement
    await db.collection("users").doc(uid).set(
      {
        premiumStatus: "premium",
        premiumGrantedAt:
          admin.firestore.FieldValue.serverTimestamp(),
        premiumGrantedBy: decodedToken.email,
      },
      { merge: true }
    );

    // Mark the upgrade request as approved
    await db.collection("premium_requests").doc(requestId).update({
      status: "approved",
      approvedAt:
        admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: decodedToken.email,
    });

    return NextResponse.json({
      success: true,
      uid,
      status: "premium",
    });
  } catch (error) {
    console.error("Premium approval error:", error);

    return NextResponse.json(
      { error: "Failed to approve Premium request" },
      { status: 500 }
    );
  }
}