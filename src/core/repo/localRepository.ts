import {
  DEFAULT_FAMILY_SETTINGS,
  type FamilySettings,
  type Profile,
} from '@/features/profiles/types';
import type { Repository } from './types';

const PROFILES_KEY = 'wordlands.profiles.v1';
const SETTINGS_KEY = 'wordlands.settings.v1';

export class LocalRepository implements Repository {
  readonly mode = 'local' as const;

  constructor(private readonly storage: Storage = localStorage) {}

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = this.storage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  async listProfiles(): Promise<Profile[]> {
    return this.read<Profile[]>(PROFILES_KEY, []).sort((a, b) => a.createdAt - b.createdAt);
  }

  async saveProfile(profile: Profile): Promise<void> {
    const all = this.read<Profile[]>(PROFILES_KEY, []).filter((p) => p.id !== profile.id);
    all.push(profile);
    this.write(PROFILES_KEY, all);
  }

  async deleteProfile(id: string): Promise<void> {
    this.write(
      PROFILES_KEY,
      this.read<Profile[]>(PROFILES_KEY, []).filter((p) => p.id !== id),
    );
  }

  async getSettings(): Promise<FamilySettings> {
    return { ...DEFAULT_FAMILY_SETTINGS, ...this.read<Partial<FamilySettings>>(SETTINGS_KEY, {}) };
  }

  async saveSettings(settings: FamilySettings): Promise<void> {
    this.write(SETTINGS_KEY, settings);
  }
}
