/**
 * Tamil-English copy joins Tamil case suffixes to English words with a hyphen
 * ("Business-ஐ", "Digital-ஆ", "website-ல்"). Browsers treat that hyphen as a line-break
 * opportunity, which strands the suffix at the start of the next line — unreadable for
 * a Tamil reader. Inserting U+2060 WORD JOINER after the hyphen forbids that break; the
 * joiner is a default-ignorable character, so it never renders in any font.
 */
const HYPHEN_BEFORE_TAMIL = /-(?=[஀-௿])/g;

export function keepSuffix(text: string): string {
  return text.replace(HYPHEN_BEFORE_TAMIL, "-⁠");
}
