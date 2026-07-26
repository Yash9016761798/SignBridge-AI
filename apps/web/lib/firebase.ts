const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export const isFirebaseEnabled = !!apiKey && apiKey.length > 0;

let authInstance: any = null;
let appInstance: any = null;

if (isFirebaseEnabled) {
  const { initializeApp, getApps } = require('firebase/app');
  const { getAuth } = require('firebase/auth');

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  authInstance = getAuth(appInstance);
}

export const auth = authInstance;
export default appInstance;
