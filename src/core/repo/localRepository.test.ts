import { createProfile } from '@/features/profiles/types';
import { LocalRepository } from './localRepository';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, v),
  };
}

describe('LocalRepository', () => {
  it('saves, lists in creation order, updates and deletes profiles', async () => {
    const repo = new LocalRepository(memoryStorage());
    const a = createProfile({ name: 'נועה', avatar: 'fox', grade: 2, world: 'arena' }, 1, 'a');
    const b = createProfile({ name: 'דני', avatar: 'owl', grade: 4, world: 'arena' }, 2, 'b');
    await repo.saveProfile(b);
    await repo.saveProfile(a);
    expect((await repo.listProfiles()).map((p) => p.id)).toEqual(['a', 'b']);

    await repo.saveProfile({ ...a, stars: 7 });
    expect((await repo.listProfiles())[0]?.stars).toBe(7);
    expect(await repo.listProfiles()).toHaveLength(2);

    await repo.deleteProfile('a');
    expect((await repo.listProfiles()).map((p) => p.id)).toEqual(['b']);
  });

  it('returns default settings and persists changes', async () => {
    const repo = new LocalRepository(memoryStorage());
    const s = await repo.getSettings();
    expect(s.pinHash).toBeNull();
    await repo.saveSettings({ ...s, muted: true });
    expect((await repo.getSettings()).muted).toBe(true);
  });

  it('survives corrupted storage', async () => {
    const st = memoryStorage();
    st.setItem('wordlands.profiles.v1', '{not json');
    expect(await new LocalRepository(st).listProfiles()).toEqual([]);
  });
});
