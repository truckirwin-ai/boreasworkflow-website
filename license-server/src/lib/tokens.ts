import type { Tier } from '../types';

// Crockford base32 alphabet, no ambiguous characters (no 0, O, 1, I, L, U).
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

// Tier marker = first key block after BOREAS-. Must satisfy the desktop app's
// key regex (four blocks of [A-Z0-9]{5}) and its tier prefixes:
// TRIA* -> trial, SOLO* -> solo, PRAC* -> practice, ENTR* -> enterprise.
const TIER_MARKERS: Record<Tier, string> = {
  trial: 'TRIAL',
  solo: 'SOLO1',
  practice: 'PRAC1',
  enterprise: 'ENTR1',
};

/**
 * Generate a seat token in the desktop app's license key format:
 * BOREAS-<TIER>-<XXXXX>-<XXXXX>-<XXXXX> (15 random chars).
 * Entropy: 15 * log2(30) = 73.6 bits. Plenty for per-install keys behind a DB lookup.
 * The app validates this shape locally (trial keys auto-expire 10 days after
 * activation on-device); the server stays the source of truth via DB lookup.
 */
export function generateSeatToken(tier: Tier = 'trial'): string {
  const bytes = new Uint8Array(15);
  crypto.getRandomValues(bytes);
  const chars: string[] = [];
  for (const b of bytes) chars.push(ALPHABET[b % ALPHABET.length]);
  const blocks = [chars.slice(0, 5).join(''), chars.slice(5, 10).join(''), chars.slice(10, 15).join('')];
  return `BOREAS-${TIER_MARKERS[tier]}-${blocks.join('-')}`;
}
