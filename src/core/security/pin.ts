/**
 * Parent PIN: a client-side gate to keep children out of the parent area.
 * (Not server-enforced security – fine for a family app.) PBKDF2 so the raw PIN is never stored.
 */
const ITERATIONS = 100_000;

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(pin: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    key,
    256,
  );
  return toHex(bits);
}

export function isValidPin(pin: string, length = 4): boolean {
  return new RegExp(`^\\d{${length}}$`).test(pin);
}

export async function hashPin(pin: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: await derive(pin, salt), salt: toHex(salt.buffer) };
}

export async function verifyPin(pin: string, hash: string, salt: string): Promise<boolean> {
  return (await derive(pin, fromHex(salt))) === hash;
}
