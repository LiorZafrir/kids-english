/**
 * Firebase wiring. Imported lazily (dynamic import) so local-only mode ships without the SDK cost.
 * Auth: one family account (email + password). Data lives under families/{uid}/...
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
  collection,
  type Firestore,
} from 'firebase/firestore';
import type { FirebaseConfig } from '@/config/env';
import {
  DEFAULT_FAMILY_SETTINGS,
  type FamilySettings,
  type Profile,
} from '@/features/profiles/types';
import type { Repository } from '@/core/repo/types';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

export function initFirebase(config: FirebaseConfig): FirebaseServices {
  const app = initializeApp(config);
  const auth = getAuth(app);
  // IndexedDB cache => the app keeps working offline and syncs when back online.
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  return { app, auth, db };
}

export const authApi = {
  signIn: (auth: Auth, email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),
  signUp: (auth: Auth, email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password),
  signOut: (auth: Auth) => signOut(auth),
  onChange: (auth: Auth, cb: (user: User | null) => void) => onAuthStateChanged(auth, cb),
};

export class FirebaseRepository implements Repository {
  readonly mode = 'firebase' as const;

  constructor(
    private readonly db: Firestore,
    private readonly familyId: string,
  ) {}

  private profilesCol() {
    return collection(this.db, 'families', this.familyId, 'profiles');
  }

  private settingsDoc() {
    return doc(this.db, 'families', this.familyId);
  }

  async listProfiles(): Promise<Profile[]> {
    const snap = await getDocs(this.profilesCol());
    return snap.docs.map((d) => d.data() as Profile).sort((a, b) => a.createdAt - b.createdAt);
  }

  async saveProfile(profile: Profile): Promise<void> {
    await setDoc(doc(this.profilesCol(), profile.id), profile);
  }

  async deleteProfile(id: string): Promise<void> {
    await deleteDoc(doc(this.profilesCol(), id));
  }

  async getSettings(): Promise<FamilySettings> {
    const snap = await getDoc(this.settingsDoc());
    const data = snap.exists() ? (snap.data().settings as Partial<FamilySettings> | undefined) : {};
    return { ...DEFAULT_FAMILY_SETTINGS, ...data };
  }

  async saveSettings(settings: FamilySettings): Promise<void> {
    await setDoc(this.settingsDoc(), { settings }, { merge: true });
  }
}
