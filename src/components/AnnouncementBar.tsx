'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from '../lib/router';
import { useSite } from '../lib/cms/SiteContent';

/** Optional site-wide announcement, controlled from Admin → General Settings. */
export default function AnnouncementBar() {
  const { announcement } = useSite('general');
  const [dismissed, setDismissed] = useState(false);
  if (!announcement.visible || !announcement.text || dismissed) return null;

  const isInternal = announcement.link?.startsWith('/');
  const text = <span className="truncate">{announcement.text}</span>;

  return (
    <div className="px-4 mb-2.5 flex justify-center">
      <div className="max-w-full rounded-full bg-(--brand-teal) text-white text-xs font-semibold shadow-lg shadow-black/20">
      <div className="pl-4 pr-2 py-1.5 flex items-center gap-2 min-w-0">
        {announcement.link ? (
          isInternal ? (
            <Link to={announcement.link} className="min-w-0 flex hover:underline underline-offset-2">{text}</Link>
          ) : (
            <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="min-w-0 flex hover:underline underline-offset-2">{text}</a>
          )
        ) : text}
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss announcement" className="shrink-0 p-0.5 rounded hover:bg-white/15">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      </div>
    </div>
  );
}
