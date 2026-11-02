import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { contentDir } from './shared';

/** Metadata for the info row between a document's title and page actions. */
export interface DocInfo {
  /**
   * Word-style count: CJK ideographs and kana count individually, each
   * latin/numeric run counts as one word; Markdown syntax, URLs and
   * whitespace are excluded (see {@link countWords}).
   */
  wordCount: number;
  /**
   * Date of the last commit touching the file, formatted as
   * `YYYY/M/D H:MM:SS` — month, day and the hour's leading zero are dropped
   * (`09:05:03` → `9:05:03`), minutes and seconds keep two digits.
   * `undefined` when the file has no git history yet.
   */
  lastUpdated?: string;
}

const cache = new Map<string, DocInfo>();

/**
 * Read the on-disk facts behind the info row. Static rendering may evaluate
 * the same page more than once (dev re-renders, prerender passes), so each
 * file is resolved and counted a single time.
 *
 * @param page a fumadocs page — `absolutePath` is preferred; `path` (relative
 *   to the content dir, with or without the locale prefix depending on the
 *   loader pass) is used as fallback.
 */
export function getPageInfo(page: {
  path: string;
  absolutePath?: string | undefined;
  locale?: string | undefined;
}): DocInfo {
  const key = page.absolutePath ?? `${page.locale ?? ''}:${page.path}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const file = resolveFile(page);
  const info: DocInfo = {
    wordCount: file ? countWords(file.source) : 0,
    lastUpdated: file ? getLastUpdate(file.absPath) : undefined,
  };
  cache.set(key, info);
  return info;
}

function resolveFile(page: {
  path: string;
  absolutePath?: string | undefined;
  locale?: string | undefined;
}): { absPath: string; source: string } | undefined {
  const root = path.join(process.cwd(), contentDir);
  const candidates: (string | undefined)[] = [
    page.absolutePath,
    path.join(root, page.path),
    page.locale ? path.join(root, page.locale, page.path) : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return { absPath: candidate, source: readFileSync(candidate, 'utf8') };
    } catch {}
  }
  return undefined;
}

/**
 * `git log -1` for the file inside the content repo (content/docs carries its
 * own .git). The pathspec is derived from the absolute path, so it is
 * correct regardless of how `page.path` is virtualized.
 */
function getLastUpdate(absPath: string): string | undefined {
  const root = path.join(process.cwd(), contentDir);
  const relative = path.relative(root, absPath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return undefined; // outside the content repo — no history to ask for
  }

  try {
    const iso = execFileSync(
      'git',
      ['-C', root, 'log', '-1', '--format=%cI', '--', relative],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return iso ? formatDocDate(new Date(iso)) : undefined;
  } catch {
    return undefined; // git unavailable at build time
  }
}

/** `2026/3/5 9:05:03` — see DocInfo.lastUpdated for the zero-dropping rules. */
function formatDocDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  return `${year}/${month}/${day} ${hour}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Word-style word count: strip frontmatter and Markdown/MDX syntax down to
 * prose tokens, then count every CJK/kana character and every latin/numeric
 * run as one word each.
 */
function countWords(markdown: string): number {
  let text = markdown;
  // frontmatter
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ' ');
  // fenced code: drop the fence lines, keep the contents
  text = text.replace(/^\s*(?:```|~~~).*$/gm, ' ');
  // MDX import/export statements (require `from '...'` to avoid prose)
  text = text.replace(/^(?:import|export)\s.*\bfrom\s+['"].*$/gm, ' ');
  // images and links: keep the visible text, drop targets/URLs
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  // reference-style link definitions
  text = text.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, ' ');
  // HTML/JSX tags
  text = text.replace(/<\/?[A-Za-z][^>]*>/g, ' ');
  // heading / bold / italic / strikethrough / inline-code markers
  text = text.replace(/[*_~`#]/g, ' ');
  // blockquote and table separators
  text = text.replace(/[|>]/g, ' ');
  // list bullets, horizontal rules and ordered-list numbering (line starts,
  // so hyphens inside words survive)
  text = text.replace(/^\s*(?:[-+]\s+|\d+\.\s+|-{3,}\s*$)/gm, ' ');

  const cjk = text.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿]/g);
  const words = text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g);
  return (cjk?.length ?? 0) + (words?.length ?? 0);
}
