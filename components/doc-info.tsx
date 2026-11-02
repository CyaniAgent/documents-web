'use client';

import { useTranslations } from '@fuma-translate/react';

/**
 * Info row between the document title and the page actions: total word count
 * and last update time (formatted as `YYYY/M/D H:MM:SS`, leading zeros per
 * spec).
 *
 * The date is computed and formatted server-side (see lib/page-info.ts) and
 * passed in as a plain string, so server and client renders always agree.
 * Translations come from the registry in lib/layout.shared.tsx; en falls back
 * to the source-string key.
 */
export function DocInfoRow({
  wordCount,
  lastUpdated,
}: {
  wordCount: number;
  lastUpdated?: string;
}) {
  const t = useTranslations();
  const count = String(wordCount);

  return (
    <p className="text-sm text-fd-muted-foreground">
      {lastUpdated
        ? t('{count} words · {date}', {
            variables: { count, date: lastUpdated },
          })
        : t('{count} words', { variables: { count } })}
    </p>
  );
}
