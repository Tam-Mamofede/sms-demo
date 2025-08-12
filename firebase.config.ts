import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

if (import.meta.env.PROD) {
  console.log("ENV sanity:", {
    apiKeyStartsWith: firebaseConfig.apiKey?.slice(0, 4),
    apiKeyLen: firebaseConfig.apiKey?.length ?? 0,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });
}
if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.startsWith("AIza")) {
  throw new Error("Firebase apiKey missing/invalid at runtime.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
