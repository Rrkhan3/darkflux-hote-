import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, storedKey] = storedHash.split(':');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  const storedKeyBuffer = Buffer.from(storedKey, 'hex');
  // Ensure buffers are same length for timing-safe comparison
  if (derivedKey.length !== storedKeyBuffer.length) return false;
  return timingSafeEqual(derivedKey, storedKeyBuffer);
}

export function maskPassword(): string {
  return '••••••••';
}
