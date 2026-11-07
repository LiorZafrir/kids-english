import { createProfile, defaultWorldFor, validateName } from './types';

describe('profile helpers', () => {
  it('validates names', () => {
    expect(validateName('  ')).toBe('required');
    expect(validateName('a'.repeat(21))).toBe('tooLong');
    expect(validateName(' נועה ')).toBeNull();
  });

  it('defaults world by grade', () => {
    expect(defaultWorldFor('kg')).toBe('garden');
    expect(defaultWorldFor(2)).toBe('arena');
    expect(defaultWorldFor(4)).toBe('arena');
  });

  it('creates a clean starting profile', () => {
    const p = createProfile(
      { name: ' נועה ', avatar: 'fox', grade: 'kg', world: 'garden' },
      5,
      'x',
    );
    expect(p).toMatchObject({
      id: 'x',
      name: 'נועה',
      stars: 0,
      companion: { stage: 'egg', xp: 0 },
      streak: { current: 0 },
    });
  });
});
