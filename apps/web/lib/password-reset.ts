import { createHmac, timingSafeEqual } from 'crypto';

// Stateless reset tokens: userId.expiry.signature, where the signature covers the
// user's current password hash. Changing the password invalidates every issued token.
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function secret() {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET is not configured');
  return s;
}

function sign(userId: string, expires: number, passwordHash: string) {
  return createHmac('sha256', secret())
    .update(`${userId}.${expires}.${passwordHash}`)
    .digest('base64url');
}

export function createResetToken(userId: string, passwordHash: string) {
  const expires = Date.now() + TOKEN_TTL_MS;
  return `${userId}.${expires}.${sign(userId, expires, passwordHash)}`;
}

export function parseResetToken(token: string) {
  const [userId, expiresRaw, signature] = token.split('.');
  const expires = Number(expiresRaw);
  if (!userId || !signature || !Number.isFinite(expires)) return null;
  return { userId, expires, signature };
}

export function verifyResetToken(token: string, passwordHash: string) {
  const parsed = parseResetToken(token);
  if (!parsed || parsed.expires < Date.now()) return false;
  const expected = Buffer.from(sign(parsed.userId, parsed.expires, passwordHash));
  const given = Buffer.from(parsed.signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
