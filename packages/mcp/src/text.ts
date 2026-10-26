/** Lower-cases and strips everything but letters and digits: "Icon button" and "icon-button" both become "iconbutton". */
export const squash = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Levenshtein distance, early-exiting past `max`. */
export function distance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur[j] = v;
      if (v < min) min = v;
    }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length]!;
}

/** The closest candidates to `query` by prefix, substring, then edit distance. */
export function closest(query: string, candidates: string[], limit = 5): string[] {
  const q = squash(query);
  if (!q) return [];
  return candidates
    .map((c) => {
      const s = squash(c);
      const score = s.startsWith(q) ? 0 : s.includes(q) || q.includes(s) ? 1 : distance(q, s, 3) + 1;
      return { c, score };
    })
    .filter((x) => x.score <= 4)
    .sort((a, b) => a.score - b.score || a.c.localeCompare(b.c))
    .slice(0, limit)
    .map((x) => x.c);
}
