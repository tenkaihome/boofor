import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

if (!admin.apps.length) {
  try {
    let serviceAccount;
    const serviceAccountPath = path.join(process.cwd(), "services", "privatekey.json");
    
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    } else if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
    } else {
      throw new Error("Missing Firebase credentials: privatekey.json file not found and FIREBASE_PRIVATE_KEY_JSON environment variable not set.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://unichat-acfc2-default-rtdb.firebaseio.com",
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminDb = admin.database();

// Pre-create the admin user "liam" with password "389363" if it doesn't exist
const initializeAdminAccount = async () => {
  try {
    const userRef = adminDb.ref("boofor/users/liam");
    const snapshot = await userRef.once("value");
    if (!snapshot.exists()) {
      const crypto = await import("crypto");
      const hashedPassword = crypto.createHash("sha256").update("389363").digest("hex");
      await userRef.set({
        username: "liam",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
      });
      console.log("Admin account 'liam' pre-created successfully.");
    }
  } catch (error) {
    console.error("Failed to initialize admin account:", error);
  }
};

initializeAdminAccount();
