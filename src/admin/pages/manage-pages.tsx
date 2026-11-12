'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CloudUpload, ExternalLink, RotateCcw, Trash2 } from 'lucide-react';
import CollectionEditor from '../editor/CollectionEditor';
import { useCmsCtx } from '../editor/useCmsCtx';
import { StatusBadge } from '../editor/DocEditor';
import { faqFields, jobFields, newJob, stepFields } from '../schemas';
import { services, type ContentDocMeta } from '../../lib/services';
import { contentLabels, type ContentKey } from '../../lib/cms/defaults';
import { subscribe } from '../../lib/cms/idb';
import { Button, Card, ConfirmDialog, PageHeader, Skeleton, Tabs, timeAgo } from '../ui/kit';
import { useToast } from '../ui/toast';
import { useAdmin } from '../context';
import { newId } from '../editor/fields';

export function JobsEditor() {
  const ctx = useCmsCtx();
  return (
    <CollectionEditor
      contentKey="jobs"
      title="Job listings"
      description="Create, edit, reorder and publish overseas vacancies shown on the Careers page."
      itemLabel="Job"
      fields={jobFields}
      itemTitle={(j) => j.title}
      itemSubtitle={(j) => [j.flagEmoji, j.location, j.industry, j.salaryNote].filter(Boolean).join(' · ')}
      idPrefix="job"
      newItem={newJob}
      searchKeys={['title', 'location', 'industry', 'destinationCountry', 'qualification']}
      filter={{ key: 'destinationCountry', label: 'Countries', options: (c) => c.countries ?? [] }}
      ctx={ctx}
      previewPath="/careers"
    />
  );
}

const editorHref: Record<ContentKey, string> = {
  home: '/admin/home', about: '/admin/about', servicesPage: '/admin/services', services: '/admin/services',
  careersPage: '/admin/careers', jobs: '/admin/jobs', contactPage: '/admin/contact', company: '/admin/contact',
  galleryPage: '/admin/gallery', gallery: '/admin/gallery', faqs: '/admin/content?tab=faqs', steps: '/admin/content?tab=steps',
  headerFooter: '/admin/header-footer', seo: '/admin/seo', design: '/admin/design', general: '/admin/settings',
};

function ContentOverview() {
  const { canEdit, navigate } = useAdmin();
  const toast = useToast();
  const [metas, setMetas] = useState<ContentDocMeta[] | null>(null);
  const [confirm, setConfirm] = useState<{ key: ContentKey; action: 'discard' | 'reset' } | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(() => services.content.listMeta().then(setMetas), []);
  useEffect(() => { load(); return subscribe((e) => e.type === 'content' && load()); }, [load]);

  const drafts = metas?.filter((m) => m.hasDraft) ?? [];

  const publishAll = async () => {
    setBusy('all');
    try {
      for (const m of drafts) await services.content.publish(m.key);
      toast.success(`Published ${drafts.length} draft${drafts.length === 1 ? '' : 's'}`);
    } catch (err) { toast.error('Publishing failed', err); }
    finally { setBusy(''); load(); }
  };

  const run = async () => {
    if (!confirm) return;
    setBusy(confirm.key);
    try {
      if (confirm.action === 'discard') await services.content.discardDraft(confirm.key);
      else await services.content.resetToDefault(confirm.key);
      toast.success(confirm.action === 'discard' ? 'Draft discarded' : 'Original content restored');
    } catch (err) { toast.error('Action failed', err); }
    finally { setBusy(''); setConfirm(null); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Sections with unpublished drafts', value: drafts.length, tone: 'text-[#5d52d6]' },
          { label: 'Published custom sections', value: metas?.filter((m) => m.status === 'published').length ?? 0, tone: 'text-emerald-600' },
          { label: 'Using original content', value: metas?.filter((m) => m.status === 'default').length ?? 0, tone: 'text-[#5E696B]' },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className={`text-3xl font-extrabold font-heading ${s.tone}`}>{metas ? s.value : '–'}</p>
            <p className="text-xs text-[#8A9496] mt-1 font-medium">{s.label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4">
          <div>
            <h3 className="text-[15px] font-bold font-heading">All content</h3>
            <p className="text-xs text-[#8A9496]">Every editable area of the website and its publishing status.</p>
          </div>
          <Button icon={CloudUpload} disabled={!canEdit || drafts.length === 0} loading={busy === 'all'} onClick={publishAll}>Publish all drafts ({drafts.length})</Button>
        </div>
        {!metas ? <div className="p-5 space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : (
          <ul className="divide-y divide-[#F2F5F4]">
            {metas.map((m) => (
              <li key={m.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 sm:px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{contentLabels[m.key]}</p>
                  <p className="text-xs text-[#8A9496]">{m.updatedAt ? `Saved ${timeAgo(m.updatedAt)}${m.updatedBy ? ` by ${m.updatedBy}` : ''}` : 'Never edited'}</p>
                </div>
                <StatusBadge meta={m} />
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="soft" icon={ExternalLink} onClick={() => navigate(editorHref[m.key])}>Edit</Button>
                  {m.hasDraft && <Button size="sm" variant="secondary" disabled={!canEdit} loading={busy === m.key} onClick={async () => { setBusy(m.key); try { await services.content.publish(m.key); toast.success(`${contentLabels[m.key]} published`); } catch (e) { toast.error('Publish failed', e); } finally { setBusy(''); load(); } }}>Publish</Button>}
                  {m.hasDraft && <button type="button" disabled={!canEdit} onClick={() => setConfirm({ key: m.key, action: 'discard' })} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" title="Discard draft" aria-label="Discard draft"><Trash2 className="w-4 h-4" /></button>}
                  {m.status !== 'default' && <button type="button" disabled={!canEdit} onClick={() => setConfirm({ key: m.key, action: 'reset' })} className="p-2 rounded-lg text-[#8A9496] hover:text-[#E5484D] hover:bg-red-50" title="Restore original" aria-label="Restore original"><RotateCcw className="w-4 h-4" /></button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={run}
        loading={!!confirm && busy === confirm.key}
        title={confirm?.action === 'reset' ? 'Restore original content?' : 'Discard draft?'}
        confirmLabel={confirm?.action === 'reset' ? 'Restore original' : 'Discard'}
        message={confirm ? (confirm.action === 'reset' ? <>All edits to <b>{contentLabels[confirm.key]}</b> are removed and the website shows the original content.</> : <>The unpublished draft of <b>{contentLabels[confirm.key]}</b> is deleted.</>) : ''}
      />
    </div>
  );
}

export function ContentManager({ initialTab }: { initialTab?: string }) {
  const [tab, setTab] = useState<'overview' | 'faqs' | 'steps'>(initialTab === 'faqs' || initialTab === 'steps' ? initialTab : 'overview');
  return (
    <div>
      {tab === 'overview' && <PageHeader title="Content manager" description="See what’s drafted and published across the site, and manage FAQs and recruitment steps." />}
      <Tabs className="mb-5" value={tab} onChange={setTab} tabs={[{ value: 'overview', label: 'Publishing status' }, { value: 'faqs', label: 'FAQs' }, { value: 'steps', label: 'Recruitment steps' }]} />
      {tab === 'overview' && <ContentOverview />}
      {tab === 'faqs' && (
        <CollectionEditor contentKey="faqs" title="FAQs" description="Questions shown on the home page." itemLabel="Question" fields={faqFields}
          itemTitle={(f) => f.question} itemSubtitle={(f) => f.answer} idPrefix="faq" newItem={() => ({ id: newId('faq'), question: '', answer: '' })}
          searchKeys={['question', 'answer']} previewPath="/" />
      )}
      {tab === 'steps' && (
        <CollectionEditor contentKey="steps" title="Recruitment steps" description="The process timeline on the home page." itemLabel="Step" fields={stepFields}
          itemTitle={(s) => `${s.step} · ${s.title}`} itemSubtitle={(s) => s.description} idPrefix="step" newItem={() => ({ step: '', title: '', description: '', icon: 'Send' })}
          searchKeys={['title', 'description']} previewPath="/" />
      )}
    </div>
  );
}
