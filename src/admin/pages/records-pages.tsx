'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, FileText, FileUser, Inbox, Mail, MessageCircle, Phone, Search, Trash2, CheckCheck, Send } from 'lucide-react';
import {
  services, type Application, type ApplicationStatus, type Enquiry, type EnquiryStatus, type Note,
} from '../../lib/services';
import { subscribe } from '../../lib/cms/idb';
import {
  Badge, Button, Card, ConfirmDialog, cx, Drawer, EmptyState, FieldShell, Input, PageHeader, Select, Skeleton, Textarea, formatBytes, formatDate, timeAgo, downloadFile,
} from '../ui/kit';
import { useToast } from '../ui/toast';
import { useAdmin } from '../context';

export const appStatuses: Array<{ value: ApplicationStatus; label: string; tone: 'blue' | 'amber' | 'lavender' | 'teal' | 'green' | 'red' }> = [
  { value: 'new', label: 'New', tone: 'blue' },
  { value: 'reviewing', label: 'Reviewing', tone: 'amber' },
  { value: 'shortlisted', label: 'Shortlisted', tone: 'lavender' },
  { value: 'interview', label: 'Interview', tone: 'teal' },
  { value: 'selected', label: 'Selected', tone: 'green' },
  { value: 'rejected', label: 'Not selected', tone: 'red' },
];
const statusMeta = (s: ApplicationStatus) => appStatuses.find((x) => x.value === s)!;

const enqStatuses: Array<{ value: EnquiryStatus; label: string; tone: 'blue' | 'amber' | 'green' }> = [
  { value: 'new', label: 'New', tone: 'blue' },
  { value: 'in-progress', label: 'In progress', tone: 'amber' },
  { value: 'resolved', label: 'Resolved', tone: 'green' },
];

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function NotesPanel({ notes, onAdd, disabled }: { notes: Note[]; onAdd: (text: string) => Promise<void>; disabled?: boolean }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold font-heading">Internal notes</h4>
      {notes.length === 0 ? <p className="text-xs text-[#8A9496]">No notes yet. Notes are only visible to admins.</p> : (
        <ul className="space-y-2">
          {[...notes].reverse().map((n) => (
            <li key={n.id} className="rounded-2xl bg-[#F2F6F5] px-4 py-3">
              <p className="text-sm whitespace-pre-wrap">{n.text}</p>
              <p className="text-[11px] text-[#8A9496] mt-1">{n.by} · {timeAgo(n.at)}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 items-end">
        <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note (e.g. called candidate, documents pending)…" disabled={disabled} />
        <Button icon={Send} loading={busy} disabled={disabled || !text.trim()} onClick={async () => { setBusy(true); try { await onAdd(text); setText(''); } finally { setBusy(false); } }} aria-label="Add note"><span className="sr-only">Add</span></Button>
      </div>
    </div>
  );
}

/* ====================================================================== */
export function ApplicationsManager() {
  const { canEdit, refreshUnread } = useAdmin();
  const toast = useToast();
  const params = useSearchParams();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | ApplicationStatus>('');
  const [job, setJob] = useState('');
  const [sort, setSort] = useState<'new' | 'old' | 'name'>('new');
  const [openId, setOpenId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Application | null>(null);

  const load = useCallback(() => services.applications.list().then(setApps).catch((e) => { toast.error('Could not load applications', e); setApps([]); }), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); return subscribe((e) => e.type === 'records' && load()); }, [load]);

  useEffect(() => { const id = params?.get('open'); if (id) setOpenId(id); }, [params]);

  const open = apps?.find((a) => a.id === openId) ?? null;

  useEffect(() => {
    if (open && !open.read && canEdit) services.applications.update(open.id, { read: true }).then(() => refreshUnread());
  }, [open, canEdit, refreshUnread]);

  const jobs = useMemo(() => Array.from(new Set((apps ?? []).map((a) => a.preferredJob).filter(Boolean))).sort(), [apps]);
  const filtered = useMemo(() => (apps ?? []).filter((a) =>
    (!status || a.status === status) && (!job || a.preferredJob === job) &&
    (!q || `${a.fullName} ${a.email} ${a.phone} ${a.code} ${a.qualification}`.toLowerCase().includes(q.toLowerCase())),
  ).sort((a, b) => sort === 'name' ? a.fullName.localeCompare(b.fullName) : sort === 'old' ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt)), [apps, status, job, q, sort]);

  const counts = useMemo(() => Object.fromEntries(appStatuses.map((s) => [s.value, (apps ?? []).filter((a) => a.status === s.value).length])), [apps]);

  const exportCsv = () => {
    const rows = [['Code', 'Name', 'Email', 'Phone', 'Job', 'Qualification', 'Experience (yrs)', 'Status', 'Submitted', 'CV file', 'Sample'],
      ...filtered.map((a) => [a.code, a.fullName, a.email, a.phone, a.preferredJob, a.qualification, a.experienceYears, statusMeta(a.status).label, formatDate(a.submittedAt, true), a.cvFileName ?? '', a.sample ? 'yes' : ''])];
    downloadFile(`meero-applications-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv');
  };

  const openCv = async (a: Application) => {
    const url = await services.applications.cvUrl(a.id);
    if (!url) { toast.error('CV file not found'); return; }
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div>
      <PageHeader title="Applications" description="Candidate records from the website application form."
        actions={<Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>} />

      {/* Status pipeline */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        <button type="button" onClick={() => setStatus('')} className={cx('shrink-0 px-4 h-9 rounded-full text-xs font-semibold border transition-colors', !status ? 'bg-[#171B20] text-white border-[#171B20]' : 'bg-white/80 border-white text-[#5E696B]')}>All <span className="opacity-70">{apps?.length ?? 0}</span></button>
        {appStatuses.map((s) => (
          <button key={s.value} type="button" onClick={() => setStatus(s.value)} className={cx('shrink-0 px-4 h-9 rounded-full text-xs font-semibold border transition-colors', status === s.value ? 'bg-[#171B20] text-white border-[#171B20]' : 'bg-white/80 border-white text-[#5E696B] hover:text-[#171B20]')}>
            {s.label} <span className="opacity-70">{counts[s.value] ?? 0}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-2.5 p-4 sm:p-5 border-b border-[#EDF2F1]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3ACAE] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone or code" className="pl-9" aria-label="Search applications" />
          </div>
          <Select value={job} onChange={(e) => setJob(e.target.value)} className="md:w-64" aria-label="Filter by job" options={[{ value: '', label: 'All jobs' }, ...jobs]} />
          <Select value={sort} onChange={(e) => setSort(e.target.value as any)} className="md:w-44" aria-label="Sort" options={[{ value: 'new', label: 'Newest first' }, { value: 'old', label: 'Oldest first' }, { value: 'name', label: 'Name A–Z' }]} />
        </div>

        {!apps ? <div className="p-5 space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div> :
          filtered.length === 0 ? <EmptyState icon={FileUser} title={apps.length ? 'No applications match' : 'No applications yet'} text={apps.length ? 'Try other filters.' : 'Applications submitted on the website appear here.'} /> : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-[#A3ACAE]">
                      <th className="font-semibold px-5 py-3">Candidate</th>
                      <th className="font-semibold px-3 py-3">Applied for</th>
                      <th className="font-semibold px-3 py-3">Experience</th>
                      <th className="font-semibold px-3 py-3">Status</th>
                      <th className="font-semibold px-3 py-3">Submitted</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F5F4]">
                    {filtered.map((a) => (
                      <tr key={a.id} onClick={() => setOpenId(a.id)} className="cursor-pointer hover:bg-[#168F88]/4 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#168F88]/15 to-[#8B80F9]/20 text-[#127a74] text-xs font-bold flex items-center justify-center shrink-0">
                              {a.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                              {!a.read && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#E5484D] ring-2 ring-white" />}
                            </span>
                            <div className="min-w-0">
                              <p className={cx('truncate', a.read ? 'font-semibold' : 'font-bold')}>{a.fullName} {a.sample && <Badge tone="slate" className="ml-1">Sample</Badge>}</p>
                              <p className="text-xs text-[#8A9496] truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 max-w-[260px]"><p className="truncate">{a.preferredJob || 'General pool'}</p><p className="text-xs text-[#8A9496] truncate">{a.qualification}</p></td>
                        <td className="px-3 py-3 whitespace-nowrap">{a.experienceYears} yrs</td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={a.status}
                            disabled={!canEdit}
                            aria-label={`Status for ${a.fullName}`}
                            onChange={async (e) => { await services.applications.update(a.id, { status: e.target.value as ApplicationStatus }); toast.success('Status updated'); }}
                            className="text-xs font-semibold rounded-full border border-[#E0E7E5] bg-white px-2.5 h-8 focus:outline-none focus:ring-2 focus:ring-[#168F88]/30"
                          >
                            {appStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-3 text-xs text-[#6B7678] whitespace-nowrap">{timeAgo(a.submittedAt)}</td>
                        <td className="px-5 py-3 text-right">{a.hasCv && <FileText className="w-4 h-4 text-[#168F88] inline" aria-label="CV attached" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <ul className="lg:hidden divide-y divide-[#F2F5F4]">
                {filtered.map((a) => {
                  const s = statusMeta(a.status);
                  return (
                    <li key={a.id}>
                      <button type="button" onClick={() => setOpenId(a.id)} className="w-full text-left px-4 py-3.5 flex items-start gap-3">
                        <span className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#168F88]/15 to-[#8B80F9]/20 text-[#127a74] text-xs font-bold flex items-center justify-center shrink-0">
                          {a.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          {!a.read && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#E5484D] ring-2 ring-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className={cx('text-sm truncate', a.read ? 'font-semibold' : 'font-bold')}>{a.fullName}</span>
                            <span className="text-[11px] text-[#8A9496] shrink-0">{timeAgo(a.submittedAt)}</span>
                          </span>
                          <span className="block text-xs text-[#8A9496] truncate">{a.preferredJob || 'General pool'}</span>
                          <span className="flex gap-1.5 mt-1.5"><Badge tone={s.tone}>{s.label}</Badge>{a.sample && <Badge tone="slate">Sample</Badge>}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
      </Card>

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.fullName ?? ''}
        subtitle={open && <span className="flex flex-wrap items-center gap-2">{open.code} · {formatDate(open.submittedAt, true)} {open.sample && <Badge tone="slate">Sample record</Badge>}</span>}
        footer={open && (
          <>
            <Button variant="ghost" icon={Trash2} className="mr-auto text-[#E5484D]" disabled={!canEdit} onClick={() => setToDelete(open)}>Delete</Button>
            <Button variant="secondary" onClick={() => setOpenId(null)}>Close</Button>
          </>
        )}
      >
        {open && (
          <div className="space-y-6">
            <FieldShell label="Status">
              <div className="flex flex-wrap gap-2">
                {appStatuses.map((s) => (
                  <button key={s.value} type="button" disabled={!canEdit} onClick={async () => { await services.applications.update(open.id, { status: s.value }); toast.success(`Moved to ${s.label}`); }}
                    className={cx('px-3.5 h-8 rounded-full text-xs font-semibold border transition-colors', open.status === s.value ? 'bg-[#171B20] text-white border-[#171B20]' : 'bg-white border-[#E0E7E5] text-[#5E696B] hover:border-[#168F88]/40')}>
                    {s.label}
                  </button>
                ))}
              </div>
            </FieldShell>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Applied for', open.preferredJob || 'General candidate pool'], ['Qualification', open.qualification],
                ['Experience', `${open.experienceYears} years`], ['Current location', open.currentLocation || '—'], ['Phone', open.phone], ['Email', open.email], ['Last updated', formatDate(open.updatedAt, true)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white border border-[#EDF2F1] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-[#A3ACAE] font-semibold">{k}</p>
                  <p className="text-sm font-semibold mt-0.5 break-words">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${open.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#168F88]/10 text-[#127a74] text-xs font-semibold hover:bg-[#168F88]/15"><Phone className="w-4 h-4" /> Call</a>
              <a href={`https://wa.me/${open.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#25D366]/15 text-[#128C4B] text-xs font-semibold hover:bg-[#25D366]/25"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
              <a href={`mailto:${open.email}`} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#8B80F9]/12 text-[#5d52d6] text-xs font-semibold hover:bg-[#8B80F9]/20"><Mail className="w-4 h-4" /> Email</a>
            </div>
            <div className="rounded-2xl border border-[#EDF2F1] bg-white p-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#168F88]/10 text-[#168F88] flex items-center justify-center"><FileText className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{open.hasCv ? open.cvFileName : 'No CV file'}</p>
                <p className="text-xs text-[#8A9496]">{open.hasCv ? formatBytes(open.cvSize ?? 0) : open.sample ? 'Sample records have no file.' : 'The candidate did not attach a file.'}</p>
              </div>
              {open.hasCv && <Button size="sm" variant="soft" onClick={() => openCv(open)}>Open CV</Button>}
            </div>
            <NotesPanel notes={open.notes} disabled={!canEdit} onAdd={async (t) => { try { await services.applications.addNote(open.id, t); toast.success('Note added'); } catch (e) { toast.error('Could not add note', e); } }} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog open={!!toDelete} onCancel={() => setToDelete(null)} title="Delete this application?" message={<>The record for <b>{toDelete?.fullName}</b> and any attached CV are permanently removed.</>}
        onConfirm={async () => { if (!toDelete) return; await services.applications.remove(toDelete.id); setToDelete(null); setOpenId(null); toast.success('Application deleted'); }} />
    </div>
  );
}

/* ====================================================================== */
export function EnquiriesManager() {
  const { canEdit, refreshUnread } = useAdmin();
  const toast = useToast();
  const params = useSearchParams();
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | EnquiryStatus>('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Enquiry | null>(null);

  const load = useCallback(() => services.enquiries.list().then(setItems).catch(() => setItems([])), []);
  useEffect(() => { load(); return subscribe((e) => e.type === 'records' && load()); }, [load]);
  useEffect(() => { const id = params?.get('open'); if (id) setOpenId(id); }, [params]);

  const open = items?.find((x) => x.id === openId) ?? null;
  useEffect(() => {
    if (open && !open.read && canEdit) services.enquiries.update(open.id, { read: true }).then(() => refreshUnread());
  }, [open, canEdit, refreshUnread]);

  const filtered = (items ?? []).filter((e) => (!status || e.status === status) && (!q || `${e.name} ${e.email} ${e.phone} ${e.message}`.toLowerCase().includes(q.toLowerCase())));
  const unread = (items ?? []).filter((e) => !e.read);

  return (
    <div>
      <PageHeader title="Enquiries" description="Messages sent through the website contact form."
        actions={
          <>
            <Button variant="secondary" icon={CheckCheck} disabled={!canEdit || unread.length === 0} onClick={async () => { await Promise.all(unread.map((e) => services.enquiries.update(e.id, { read: true }))); refreshUnread(); toast.success('All marked as read'); }}>Mark all read</Button>
            <Button variant="secondary" icon={Download} disabled={!filtered.length} onClick={() => downloadFile(`meero-enquiries-${new Date().toISOString().slice(0, 10)}.csv`,
              [['Name', 'Email', 'Phone', 'Message', 'Status', 'Received'], ...filtered.map((e) => [e.name, e.email, e.phone, e.message, e.status, formatDate(e.createdAt, true)])].map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv')}>Export CSV</Button>
          </>
        } />
      <Card>
        <div className="flex flex-col md:flex-row gap-2.5 p-4 sm:p-5 border-b border-[#EDF2F1]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3ACAE] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or message" className="pl-9" aria-label="Search enquiries" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="md:w-48" aria-label="Status filter" options={[{ value: '', label: 'All statuses' }, ...enqStatuses]} />
        </div>
        {!items ? <div className="p-5 space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div> :
          filtered.length === 0 ? <EmptyState icon={Inbox} title={items.length ? 'No enquiries match' : 'No enquiries yet'} text="Messages from the contact form appear here." /> : (
            <ul className="divide-y divide-[#F2F5F4]">
              {filtered.map((e) => {
                const s = enqStatuses.find((x) => x.value === e.status)!;
                return (
                  <li key={e.id}>
                    <button type="button" onClick={() => setOpenId(e.id)} className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-[#168F88]/4">
                      <span className={cx('mt-1.5 w-2 h-2 rounded-full shrink-0', e.read ? 'bg-transparent' : 'bg-[#E5484D]')} />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-3">
                          <span className={cx('text-sm truncate', e.read ? 'font-semibold' : 'font-bold')}>{e.name}</span>
                          <span className="text-[11px] text-[#8A9496] shrink-0">{timeAgo(e.createdAt)}</span>
                        </span>
                        <span className="block text-xs text-[#6B7678] mt-0.5 line-clamp-2">{e.message}</span>
                        <span className="flex gap-1.5 mt-2"><Badge tone={s.tone}>{s.label}</Badge>{e.sample && <Badge tone="slate">Sample</Badge>}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
      </Card>

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.name ?? ''} subtitle={open && formatDate(open.createdAt, true)}
        footer={open && (<><Button variant="ghost" icon={Trash2} className="mr-auto text-[#E5484D]" disabled={!canEdit} onClick={() => setToDelete(open)}>Delete</Button><Button variant="secondary" onClick={() => setOpenId(null)}>Close</Button></>)}>
        {open && (
          <div className="space-y-6">
            <FieldShell label="Status">
              <div className="flex flex-wrap gap-2">
                {enqStatuses.map((s) => (
                  <button key={s.value} type="button" disabled={!canEdit} onClick={async () => { await services.enquiries.update(open.id, { status: s.value }); toast.success(`Marked ${s.label.toLowerCase()}`); }}
                    className={cx('px-3.5 h-8 rounded-full text-xs font-semibold border', open.status === s.value ? 'bg-[#171B20] text-white border-[#171B20]' : 'bg-white border-[#E0E7E5] text-[#5E696B]')}>{s.label}</button>
                ))}
              </div>
            </FieldShell>
            <div className="rounded-2xl bg-white border border-[#EDF2F1] p-4">
              {open.subject && <p className="text-sm font-bold mb-2">{open.subject}</p>}
              <p className="text-[11px] uppercase tracking-wider text-[#A3ACAE] font-semibold mb-1">Message</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{open.message}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {open.phone && <a href={`tel:${open.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#168F88]/10 text-[#127a74] text-xs font-semibold"><Phone className="w-4 h-4" /> {open.phone}</a>}
              <a href={`mailto:${open.email}?subject=${encodeURIComponent('Re: your enquiry to MEERO')}`} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#8B80F9]/12 text-[#5d52d6] text-xs font-semibold"><Mail className="w-4 h-4" /> Reply by email</a>
              {open.phone && <a href={`https://wa.me/${open.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#25D366]/15 text-[#128C4B] text-xs font-semibold"><MessageCircle className="w-4 h-4" /> WhatsApp</a>}
            </div>
            <NotesPanel notes={open.notes} disabled={!canEdit} onAdd={async (t) => { try { await services.enquiries.addNote(open.id, t); toast.success('Note added'); } catch (e) { toast.error('Could not add note', e); } }} />
          </div>
        )}
      </Drawer>
      <ConfirmDialog open={!!toDelete} onCancel={() => setToDelete(null)} title="Delete this enquiry?" message={<>The message from <b>{toDelete?.name}</b> is permanently removed.</>}
        onConfirm={async () => { if (!toDelete) return; await services.enquiries.remove(toDelete.id); setToDelete(null); setOpenId(null); toast.success('Enquiry deleted'); }} />
    </div>
  );
}
