// KJV Bible data access. The bundled JSON is public-domain KJV text,
// shaped as an array of books: { n: name, c: chapters[][verses] }.

export type BibleBook = { n: string; c: string[][] };
export type Bible = BibleBook[];

export type VerseLoc = { b: number; c: number; v: number };

let cached: Bible | null = null;

export function loadBible(): Bible {
  if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('@/assets/data/kjv.json') as Bible;
  }
  return cached;
}

export function findBookIndex(bible: Bible, name: string) {
  return bible.findIndex((b) => b.n === name);
}

export function verseRef(bible: Bible, loc: VerseLoc) {
  const book = bible[loc.b];
  if (!book) return DEFAULT_REF;
  return `${book.n} ${loc.c + 1}:${loc.v + 1}`;
}

export function verseText(bible: Bible, loc: VerseLoc) {
  const book = bible[loc.b];
  const text = book?.c[loc.c]?.[loc.v];
  return text ?? DEFAULT_TEXT;
}

export const DEFAULT_REF = 'Daniel 6:10';
export const DEFAULT_TEXT =
  'Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his God, as he did aforetime.';

export type SearchHit = VerseLoc;

export function searchBible(bible: Bible, query: string, limit = 100): { hits: SearchHit[]; total: number } {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { hits: [], total: 0 };
  const hits: SearchHit[] = [];
  let total = 0;
  for (let b = 0; b < bible.length; b++) {
    const book = bible[b];
    for (let c = 0; c < book.c.length; c++) {
      const chapter = book.c[c];
      for (let v = 0; v < chapter.length; v++) {
        if (chapter[v].toLowerCase().includes(q)) {
          total++;
          if (hits.length < limit) hits.push({ b, c, v });
        }
      }
    }
  }
  return { hits, total };
}
