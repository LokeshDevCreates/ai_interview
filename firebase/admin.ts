import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing Firebase Admin environment variables");
    }

    // TEMPORARY DEBUG - remove after fixing
    const key = process.env.FIREBASE_PRIVATE_KEY;
    console.log("KEY LENGTH:", key.length);
    console.log("FIRST 50 CHARS:", key.substring(0, 50));
    console.log("CONTAINS LITERAL \\n:", key.includes("\\n"));
    console.log("CONTAINS REAL NEWLINE:", key.includes("\n"));
    console.log("AFTER REPLACE FIRST 50:", key.replace(/\\n/g, "\n").substring(0, 50));

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, "\n")
        .replace(/^"|"$/g, ""),
      }),
    });

    getFirestore().settings({
      ignoreUndefinedProperties: true,
    });
  }
}

export function getFirebaseAdmin() {
  initializeFirebaseAdmin();

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}