/**
 * Normalizes a BMFont `info.charset` to the one shape every parser returns.
 *
 * The four source formats disagree: an ASCII `.fnt` writes `charset="ANSI"`, XML writes the same
 * field but the parser has always split it, a binary font does not expose the byte at all, and JSON
 * generators write either a name or the list of generated characters. Through 5.x the type was
 * `string | string[]` and the caller had to branch. It is `string[]` now.
 *
 * A `string` is read as the comma-separated list of charset names the BMFont spec describes, so
 * `"ANSI"` becomes `['ANSI']` and `""` becomes `[]`. An array is kept as it is, which is what a JSON
 * font's list of characters needs.
 *
 * @param {unknown} value The raw `info.charset` as the source format carried it.
 * @returns {string[]} The normalized charset.
 */
function normalizeCharset(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((entry) => `${entry}`);
  if (typeof value === 'string') return value.split(',').filter((entry) => entry !== '');
  return [];
}

export { normalizeCharset };
