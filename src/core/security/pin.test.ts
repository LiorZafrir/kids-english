// @vitest-environment node
import { hashPin, isValidPin, verifyPin } from './pin';

describe('pin', () => {
  it('accepts only 4 digits', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('12345')).toBe(false);
  });

  it('verifies the right PIN and rejects the wrong one', async () => {
    const { hash, salt } = await hashPin('4821');
    expect(hash).not.toContain('4821');
    expect(await verifyPin('4821', hash, salt)).toBe(true);
    expect(await verifyPin('4822', hash, salt)).toBe(false);
  });

  it('uses a fresh salt each time', async () => {
    const a = await hashPin('1111');
    const b = await hashPin('1111');
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
});
