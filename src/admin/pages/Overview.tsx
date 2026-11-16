'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Briefcase, CheckCircle2, ClipboardList, ExternalLink, FileStack, FileUser, Inbox, Plus, TriangleAlert, TrendingDown, TrendingUp, UploadCloud, Activity } from 'lucide-react';
import { services, type ActivityEntry, type Application, type ContentDocMeta, type Enquiry, type Job } from '../../lib/services';
import { subscribe } from '../../lib/cms/idb';
import { contentLabels } from '../../lib/cms/defaults';
import { useAdmin } from '../context';
import { Badge, Button, Card, CardHeader, Select, Skeleton, cx, timeAgo } from '../ui/kit';
import { GroupedBarChart, MiniBars, ProgressRow, RingChart } from '../ui/charts';
import { appStatuses } from './records-pages';

type Data = { apps: Application[]; enqs: Enquiry[]; jobs: Job[]; metas: ContentDocMeta[]; activity: ActivityEntry[]; mediaCount: number };

const ringColors: Record<string, string> = { new: '#3B82F6', reviewing: '#F59E0B', shortlisted: '#8B80F9', interview: '#21B8C1', selected: '#168F88', rejected: '#E5484D' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** Month-over-month change of the last two buckets; null when there is no base to compare. */
const monthTrend = (s: number[]) => (s.length > 1 && s[s.length - 2] > 0 ? Math.round(((s[s.length - 1] - s[s.length - 2]) / s[s.length - 2]) * 100) : null);

function TrendPill({ trend }: { trend: number | null }) {
  if (trend === null) return <span className="text-[11px] font-semibold text-[#A3ACAE]">No change data</span>;
  const up = trend >= 0;
  return (
    <span className={cx('inline-flex items-center gap-1 text-[11px] font-bold tabular-nums', up ? 'text-emerald-600' : 'text-[#E5484D]')} title="Change vs last month">
      <span className={cx('w-4 h-4 rounded-full inline-flex items-center justify-center text-white', up ? 'bg-emerald-500' : 'bg-[#E5484D]')}>
        {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      </span>
      {up ? '+' : ''}{trend}%
    </span>
  );
}

/** Soft-UI stat card: label left, big number right, sparkline + trend along the bottom. */
function StatCard({ label, value, sub, icon: Icon, accent, bars, onClick }: {
  label: string; value: React.ReactNode; sub: React.ReactNode; icon: React.ElementType; accent: string; bars: number[]; onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="soft-card group text-left rounded-[22px] p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168F88]">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0" style={{ background: `${accent}1A`, color: accent }}><Icon className="w-3.5 h-3.5" /></span>
            <span className="text-[13px] font-semibold text-[#2B3134] truncate">{label}</span>
          </span>
          <span className="block text-[11px] text-[#8A9496] mt-1.5 truncate">{sub}</span>
        </span>
        <span className="text-[28px] sm:text-[32px] leading-none font-semibold font-heading tracking-tight text-[#171B20] tabular-nums">{value}</span>
      </div>
      <div className="flex items-end justify-between gap-3 mt-5">
        <MiniBars values={bars} color={accent} />
        <TrendPill trend={monthTrend(bars)} />
      </div>
    </button>
  );
}

export default function Overview() {
  const { user, navigate } = useAdmin();
  const [data, setData] = useState<Data | null>(null);

  const load = useCallback(async () => {
    const [apps, enqs, jobs, metas, activity, media] = await Promise.all([
      services.applications.list(), services.enquiries.list(), services.content.getLive('jobs'),
      services.content.listMeta(), services.settings.activity(8), services.media.list(),
    ]);
    setData({ apps, enqs, jobs, metas, activity, mediaCount: media.length });
  }, []);

  useEffect(() => { load().catch(() => {}); return subscribe(() => load().catch(() => {})); }, [load]);

  const [range, setRange] = useState<'6' | '12'>('6');

  const stats = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const monthsBack = (count: number) => Array.from({ length: count }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en', { month: 'short' }) };
    });
    const bucket = <T,>(months: Array<{ key: string }>, list: T[], date: (x: T) => string | undefined) =>
      months.map((m) => list.filter((x) => { const s = date(x); if (!s) return false; const d = new Date(s); return `${d.getFullYear()}-${d.getMonth()}` === m.key; }).length);
    const chartMonths = monthsBack(Number(range));
    const received = bucket(chartMonths, data.apps, (a) => a.submittedAt);
    const selected = bucket(chartMonths, data.apps.filter((a) => a.status === 'selected'), (a) => a.updatedAt ?? a.submittedAt);
    // Sparklines: always the last 10 months.
    const spark = monthsBack(10);
    const sparkApps = bucket(spark, data.apps, (a) => a.submittedAt);
    const sparkJobs = bucket(spark, data.jobs, (j) => j.postedDate);
    const sparkEnq = bucket(spark, data.enqs, (e) => e.createdAt);
    const sparkSel = bucket(spark, data.apps.filter((a) => a.status === 'selected'), (a) => a.updatedAt ?? a.submittedAt);
    const week = Date.now() - 7 * 864e5;
    const openJobs = data.jobs.filter((j) => j.visible !== false);
    const destinations = Object.entries(openJobs.reduce<Record<string, number>>((acc, j) => { acc[j.destinationCountry] = (acc[j.destinationCountry] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      chart: chartMonths.map((m, i) => ({ label: m.label, values: [received[i], selected[i]] })),
      sparkApps, sparkJobs, sparkEnq, sparkSel,
      newThisWeek: data.apps.filter((a) => Date.parse(a.submittedAt) > week).length,
      unreadEnq: data.enqs.filter((e) => !e.read).length,
      openEnq: data.enqs.filter((e) => e.status !== 'resolved').length,
      openJobs: openJobs.length,
      selectedTotal: data.apps.filter((a) => a.status === 'selected').length,
      pipeline: appStatuses.map((s) => ({ ...s, count: data.apps.filter((a) => a.status === s.value).length })),
      destinations,
      drafts: data.metas.filter((m) => m.hasDraft),
      hasSamples: data.apps.some((a) => a.sample) || data.enqs.some((e) => e.sample),
    };
  }, [data, range]);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#8A9496]">{today}</p>
          <h1 className="text-2xl sm:text-[30px] font-extrabold tracking-tight font-heading mt-1">{greeting()}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-[#7A8587] mt-1">Here’s what’s happening across the MEERO website.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={UploadCloud} onClick={() => navigate('/admin/media')}>Upload media</Button>
          <Button variant="secondary" icon={ExternalLink} onClick={() => window.open('/', '_blank', 'noopener')}>View site</Button>
          <Button icon={Plus} onClick={() => navigate('/admin/jobs')}>New job listing</Button>
        </div>
      </div>

      {user.usingDefaultPassword && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 flex items-start sm:items-center gap-3">
          <TriangleAlert className="w-5 h-5 shrink-0" />
          <span className="flex-1">You’re signed in with the default password. Change it before sharing access.</span>
          <Button size="sm" variant="dark" onClick={() => navigate('/admin/users?me=1')}>Change password</Button>
        </div>
      )}

      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-[22px]" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4" data-tour="dashboard-stats">
            <StatCard label="Applications" value={data!.apps.length} sub={`${stats.newThisWeek} new this week`} icon={FileUser} accent="#0E9F95" bars={stats.sparkApps} onClick={() => navigate('/admin/applications')} />
            <StatCard label="Open vacancies" value={stats.openJobs} sub={`${data!.jobs.length - stats.openJobs} hidden`} icon={Briefcase} accent="#8B80F9" bars={stats.sparkJobs} onClick={() => navigate('/admin/jobs')} />
            <StatCard label="Unread enquiries" value={stats.unreadEnq} sub={`${stats.openEnq} open in total`} icon={Inbox} accent="#E0609A" bars={stats.sparkEnq} onClick={() => navigate('/admin/enquiries')} />
            <StatCard label="Selected" value={stats.selectedTotal} sub="Candidates placed" icon={CheckCircle2} accent="#3B82F6" bars={stats.sparkSel} onClick={() => navigate('/admin/applications')} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <Card className="xl:col-span-8" data-tour="dashboard-trend">
              <CardHeader
                title="Application trend"
                subtitle={stats.hasSamples ? 'Received vs selected · includes sample data' : 'Received vs selected'}
                action={<Select size="sm" value={range} onChange={(e) => setRange(e.target.value as '6' | '12')} aria-label="Time range" className="w-40" options={[{ value: '6', label: 'Last 6 months' }, { value: '12', label: 'Last 12 months' }]} />}
              />
              <div className="px-5 sm:px-6 pb-6 pt-2">
                <GroupedBarChart
                  height={330}
                  data={stats.chart}
                  series={[{ name: 'Received', color: '#0E9F95' }, { name: 'Selected', color: '#8B80F9' }]}
                  emptyText={`No applications in the last ${range} months`}
                  emptyHint="New applications from the website will appear here."
                />
              </div>
            </Card>
            <Card className="xl:col-span-4">
              <CardHeader title="Candidate pipeline" subtitle="Applications by status" />
              <div className="px-5 sm:px-6 pb-6 pt-4">
                <RingChart
                  size={190}
                  rings={stats.pipeline.filter((p) => ['selected', 'interview', 'shortlisted', 'rejected'].includes(p.value)).map((p) => ({ label: p.label, value: p.count, color: ringColors[p.value] }))}
                  center={{ value: data!.apps.length, label: 'Applications' }}
                />
                <ul className="mt-5 space-y-2">
                  {stats.pipeline.map((p) => (
                    <li key={p.value} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 font-semibold text-[#2B3134]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: ringColors[p.value] }} />{p.label}</span>
                      <span className="font-bold">{p.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4">
            <Card className="xl:col-span-5">
              <CardHeader title="Recent applications" action={<Button size="sm" variant="ghost" onClick={() => navigate('/admin/applications')}>View all <ArrowUpRight className="w-3.5 h-3.5" /></Button>} />
              <ul className="px-3 pb-4 pt-2">
                {data!.apps.slice(0, 5).map((a) => {
                  const s = appStatuses.find((x) => x.value === a.status)!;
                  return (
                    <li key={a.id}>
                      <button type="button" onClick={() => navigate(`/admin/applications?open=${a.id}`)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#168F88]/5 text-left">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#168F88]/15 to-[#8B80F9]/20 text-[#127a74] text-xs font-bold flex items-center justify-center shrink-0">{a.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                        <span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{a.fullName}</span><span className="block text-xs text-[#8A9496] truncate">{a.preferredJob || 'General pool'}</span></span>
                        <span className="text-right shrink-0"><Badge tone={s.tone}>{s.label}</Badge><span className="block text-[10px] text-[#A3ACAE] mt-1">{timeAgo(a.submittedAt)}</span></span>
                      </button>
                    </li>
                  );
                })}
                {data!.apps.length === 0 && <li className="px-3 py-6 text-sm text-[#8A9496]">No applications yet.</li>}
              </ul>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader title="Vacancies by destination" icon={ClipboardList} />
              <div className="px-5 sm:px-6 pb-6 pt-4 space-y-4">
                {stats.destinations.length === 0 ? <p className="text-sm text-[#8A9496]">No published vacancies.</p> :
                  stats.destinations.map(([country, n], i) => <ProgressRow key={country} label={country} value={n} max={stats.destinations[0][1]} color={['#168F88', '#21B8C1', '#8B80F9', '#F59E0B', '#3B82F6'][i]} />)}
              </div>
            </Card>

            <Card className="lg:col-span-2 xl:col-span-4">
              <CardHeader title="Publishing & activity" icon={Activity} />
              <div className="px-5 sm:px-6 pb-6 pt-4 space-y-4">
                <button type="button" onClick={() => navigate('/admin/content')} className={cx('w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left', stats.drafts.length ? 'bg-[#8B80F9]/10' : 'bg-[#F2F6F5]')}>
                  <FileStack className={cx('w-5 h-5', stats.drafts.length ? 'text-[#5d52d6]' : 'text-[#8A9496]')} />
                  <span className="flex-1 text-sm">
                    {stats.drafts.length ? <><b>{stats.drafts.length}</b> unpublished draft{stats.drafts.length > 1 ? 's' : ''}: {stats.drafts.slice(0, 2).map((d) => contentLabels[d.key]).join(', ')}{stats.drafts.length > 2 ? '…' : ''}</> : 'Everything is published.'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#8A9496]" />
                </button>
                <ul className="space-y-3">
                  {data!.activity.length === 0 && <li className="text-sm text-[#8A9496]">No activity yet.</li>}
                  {data!.activity.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[#21B8C1] shrink-0" />
                      <span className="text-xs leading-snug"><b>{a.actor}</b> {a.action} <b>{a.target}</b><span className="block text-[#A3ACAE] mt-0.5">{timeAgo(a.at)}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
