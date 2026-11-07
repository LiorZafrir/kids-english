import type { FamilySettings, Profile } from '@/features/profiles/types';

/**
 * All persistence goes through this interface. The UI never imports Firebase directly.
 * Implementations: LocalRepository (this device) and FirebaseRepository (synced family account).
 */
export interface Repository {
  readonly mode: 'local' | 'firebase';
  listProfiles(): Promise<Profile[]>;
  saveProfile(profile: Profile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  getSettings(): Promise<FamilySettings>;
  saveSettings(settings: FamilySettings): Promise<void>;
}
