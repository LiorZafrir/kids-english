export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/** Returns the Firebase web config, or null when env vars are missing (=> local-only mode). */
export function readFirebaseConfig(env: Record<string, string | undefined>): FirebaseConfig | null {
  const cfg = {
    apiKey: env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: env.VITE_FIREBASE_APP_ID ?? '',
  };
  return cfg.apiKey && cfg.projectId && cfg.appId ? cfg : null;
}

export const firebaseConfig = readFirebaseConfig(import.meta.env as Record<string, string>);
