/** Breath space timing (ms) */
export const BREATH_ENTER_MS = 2400;
export const BREATH_HOLD_MS = 26000;
export const BREATH_EXIT_MS = 2400;
export const BREATH_CYCLE_MS = 5200;

export const BREATH_TOTAL_MS = BREATH_ENTER_MS + BREATH_HOLD_MS + BREATH_EXIT_MS;

/** Rotating top label (changes every 2 breath cycles) */
export const BREATH_MOMENT_LABELS = [
  '· a moment of breath ·',
  '· just this breath ·',
  '· no rush ·',
  '· stay here ·',
] as const;

/** Rotating gentle cues during hold */
export const BREATH_HOLD_CUES = [
  'breathe in',
  'breathe out',
  'slow and steady',
  'soften your shoulders',
  'breathe in',
  'breathe out',
  'you are here',
  'let the exhale lengthen',
] as const;

export const BREATH_ENTER_SUBLINE = 'settling in';
export const BREATH_EXIT_SUBLINE = 'returning gently';
