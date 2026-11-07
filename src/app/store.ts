import { create } from 'zustand';
import { rollCard } from '@/content/cards';
import { itemById, type Slot } from '@/content/shop';
import { firebaseConfig } from '@/config/env';
import { applySession, type SessionResult } from '@/core/progress/applySession';
import { activeEvent } from '@/core/progress/events';
import { GOAL_BONUS_STARS, goalReached, rollGoal } from '@/core/progress/familyGoal';
import { LocalRepository } from '@/core/repo/localRepository';
import type { Repository } from '@/core/repo/types';
import {
  DEFAULT_FAMILY_SETTINGS,
  withDefaults,
  type FamilySettings,
  type Profile,
} from '@/features/profiles/types';

type Status = 'booting' | 'signed-out' | 'ready' | 'error';

interface FirebaseModule {
  services: ReturnType<typeof import('@/core/firebase/firebase').initFirebase>;
  api: typeof import('@/core/firebase/firebase');
}

/** What the caller reports when a lesson, review, battle or story ends. */
export interface FinishInput extends Pick<
  SessionResult,
  'progressKey' | 'stars' | 'results' | 'seconds' | 'xp' | 'won'
> {
  /** Chance (0 to 1) that a card drops; 1 guarantees one. */
  cardChance: number;
  /** Extra rarity boost for the drop (a won battle). */
  cardBoost?: number;
}

export interface FinishSummary {
  bonusStars: number;
  cards: string[];
  eventId: string | null;
}

interface SessionState {
  status: Status;
  mode: 'local' | 'firebase';
  repo: Repository | null;
  profiles: Profile[];
  settings: FamilySettings;
  activeProfileId: string | null;
  /** Firebase error code of the last failed sign-in, or null. */
  authError: string | null;
  /** Firebase error code when loading the family's data failed. */
  loadError: string | null;

  boot: () => Promise<void>;
  signIn: (email: string, password: string, create: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  selectProfile: (id: string | null) => void;
  addProfile: (p: Profile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  /** Saves a changed copy of one profile. */
  patchProfile: (id: string, fn: (p: Profile) => Profile) => Promise<void>;
  /** Applies a finished session to the active profile, with event bonus and card drop. */
  finishSession: (input: FinishInput) => Promise<FinishSummary>;
  buyItem: (itemId: string) => Promise<boolean>;
  equipItem: (slot: Slot, itemId: string | null) => Promise<void>;
  claimFamilyGoal: () => Promise<void>;
  updateSettings: (patch: Partial<FamilySettings>) => Promise<void>;
}

let fb: FirebaseModule | null = null;

/** Names the failing step in the console so a rules problem can be pinned down. */
async function at<T>(step: string, p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error(`[load] ${step} failed`, e);
    throw e;
  }
}

async function load(repo: Repository): Promise<Pick<SessionState, 'profiles' | 'settings'>> {
  const [raw, stored] = await Promise.all([
    at('listProfiles', repo.listProfiles()),
    at('getSettings', repo.getSettings()),
  ]);
  const profiles = raw.map(withDefaults);
  // Start a fresh weekly family goal when the week rolled over.
  const goal = rollGoal(
    stored.familyGoal ?? DEFAULT_FAMILY_SETTINGS.familyGoal,
    profiles,
    Date.now(),
  );
  const settings = { ...DEFAULT_FAMILY_SETTINGS, ...stored, familyGoal: goal };
  if (goal !== stored.familyGoal) await at('saveSettings', repo.saveSettings(settings));
  return { profiles, settings };
}

export const useSession = create<SessionState>((set, get) => ({
  status: 'booting',
  mode: firebaseConfig ? 'firebase' : 'local',
  repo: null,
  profiles: [],
  settings: DEFAULT_FAMILY_SETTINGS,
  activeProfileId: null,
  authError: null,
  loadError: null,

  async boot() {
    if (!firebaseConfig) {
      const repo = new LocalRepository();
      set({ repo, status: 'ready', ...(await load(repo)) });
      return;
    }
    const api = await import('@/core/firebase/firebase');
    fb = { api, services: api.initFirebase(firebaseConfig) };
    const { auth, db } = fb.services;
    api.authApi.onChange(auth, async (user) => {
      if (!user) {
        set({ repo: null, status: 'signed-out', profiles: [], activeProfileId: null });
        return;
      }
      const repo = new api.FirebaseRepository(db, user.uid);
      try {
        set({ repo, status: 'ready', loadError: null, ...(await load(repo)) });
      } catch (e) {
        // Usually Firestore is not created yet or its rules were not published.
        set({ status: 'error', loadError: (e as { code?: string }).code ?? 'unknown' });
      }
    });
  },

  async signIn(email, password, create) {
    if (!fb) return;
    set({ authError: null });
    try {
      const { api, services } = fb;
      await (create ? api.authApi.signUp : api.authApi.signIn)(services.auth, email, password);
    } catch (e) {
      set({ authError: (e as { code?: string }).code ?? 'unknown' });
    }
  },

  async signOut() {
    if (fb) await fb.api.authApi.signOut(fb.services.auth);
  },

  selectProfile: (id) => set({ activeProfileId: id }),

  async addProfile(p) {
    const { repo } = get();
    if (!repo) return;
    await repo.saveProfile(p);
    set({ profiles: (await repo.listProfiles()).map(withDefaults) });
  },

  async removeProfile(id) {
    const { repo, activeProfileId } = get();
    if (!repo) return;
    await repo.deleteProfile(id);
    set({
      profiles: (await repo.listProfiles()).map(withDefaults),
      activeProfileId: activeProfileId === id ? null : activeProfileId,
    });
  },

  async patchProfile(id, fn) {
    const { repo, profiles } = get();
    const current = profiles.find((p) => p.id === id);
    if (!repo || !current) return;
    const updated = fn(current);
    await repo.saveProfile(updated);
    set({ profiles: get().profiles.map((p) => (p.id === id ? updated : p)) });
  },

  async finishSession(input) {
    const { activeProfileId, patchProfile } = get();
    const now = Date.now();
    const event = activeEvent(new Date(now));
    const bonusStars = event?.bonusStars ?? 0;
    const cards =
      Math.random() < input.cardChance
        ? [rollCard(Math.random, event?.cardId, input.cardBoost ?? 0).id]
        : [];
    if (activeProfileId) {
      const session: SessionResult = {
        progressKey: input.progressKey,
        stars: input.stars,
        results: input.results,
        seconds: input.seconds,
        xp: input.xp,
        won: input.won,
        bonusStars,
        cards,
      };
      await patchProfile(activeProfileId, (p) => applySession(p, session, now));
    }
    return { bonusStars, cards, eventId: event?.id ?? null };
  },

  async buyItem(itemId) {
    const { activeProfileId, profiles, patchProfile } = get();
    const profile = profiles.find((p) => p.id === activeProfileId);
    const item = itemById(itemId);
    if (!profile || !item || profile.inventory.includes(itemId) || profile.stars < item.price) {
      return false;
    }
    await patchProfile(profile.id, (p) => ({
      ...p,
      stars: p.stars - item.price,
      inventory: [...p.inventory, itemId],
      equipped: { ...p.equipped, [item.slot]: itemId },
    }));
    return true;
  },

  async equipItem(slot, itemId) {
    const { activeProfileId, profiles, patchProfile } = get();
    const profile = profiles.find((p) => p.id === activeProfileId);
    if (!profile || (itemId && !profile.inventory.includes(itemId))) return;
    await patchProfile(profile.id, (p) => ({ ...p, equipped: { ...p.equipped, [slot]: itemId } }));
  },

  async claimFamilyGoal() {
    const { profiles, settings, patchProfile, updateSettings } = get();
    if (settings.familyGoal.claimed || !goalReached(settings.familyGoal, profiles)) return;
    await updateSettings({ familyGoal: { ...settings.familyGoal, claimed: true } });
    for (const p of profiles) {
      await patchProfile(p.id, (x) => ({
        ...x,
        stars: x.stars + GOAL_BONUS_STARS,
        cards: { ...x.cards, 'e-star': (x.cards['e-star'] ?? 0) + 1 },
      }));
    }
  },

  async updateSettings(patch) {
    const { repo, settings } = get();
    if (!repo) return;
    const next = { ...settings, ...patch };
    await repo.saveSettings(next);
    set({ settings: next });
  },
}));
