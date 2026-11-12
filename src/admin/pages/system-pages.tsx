'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Database, Download, KeyRound, Pencil, Plus, ShieldCheck, Sparkles, Trash2, TriangleAlert, UserX, UserCheck } from 'lucide-react';
import { services, STORAGE_BACKEND, type AdminRole, type AdminUser } from '../../lib/services';
import { useAdmin } from '../context';
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, FieldShell, Input, Modal, PageHeader, Select, Skeleton, downloadFile, formatBytes, timeAgo } from '../ui/kit';
import { useToast } from '../ui/toast';
import { GeneralSettingsEditor } from './content-pages';

const roleInfo: Record<AdminRole, { label: string; text: string; tone: 'lavender' | 'teal' | 'slate' }> = {
  owner: { label: 'Owner', text: 'Full access, including admin users and data tools.', tone: 'lavender' },
  editor: { label: 'Editor', text: 'Edit and publish content, manage applications and media.', tone: 'teal' },
  viewer: { label: 'Viewer', text: 'Read-only access to the dashboard.', tone: 'slate' },
};

function PasswordModal({ user, open, onClose }: { user: AdminUser | null; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setPw(''); setPw2(''); setError(''); } }, [open]);
  const submit = async () => {
    if (pw !== pw2) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try { await services.auth.setPassword(user!.id, pw); toast.success('Password updated'); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not update password'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Set password" description={user ? `For ${user.name}` : ''}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={busy} disabled={!pw}>Update password</Button></>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <FieldShell label="New password" help="At least 8 characters with letters and numbers." error={error}>
          <Input type="password" autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setError(''); }} invalid={!!error} autoFocus />
        </FieldShell>
        <FieldShell label="Confirm password"><Input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></FieldShell>
      </form>
    </Modal>
  );
}

function UserModal({ open, onClose, user }: { open: boolean; onClose: () => void; user: AdminUser | null }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' as AdminRole, password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) { setForm(user ? { name: user.name, email: user.email, role: user.role, password: '' } : { name: '', email: '', role: 'editor', password: '' }); setError(''); }
  }, [open, user]);
  const submit = async () => {
    setBusy(true);
    try {
      if (user) await services.auth.updateUser(user.id, { name: form.name.trim(), email: form.email.trim(), role: form.role });
      else await services.auth.createUser(form);
      toast.success(user ? 'User updated' : 'User added');
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save'); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={user ? 'Edit admin user' : 'Add admin user'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={busy}>{user ? 'Save changes' : 'Add user'}</Button></>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        {error && <div className="rounded-xl bg-red-50 text-[#c23b40] text-sm px-3.5 py-2.5">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldShell label="Full name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></FieldShell>
          <FieldShell label="Email" required><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FieldShell>
        </div>
        <FieldShell label="Role" help={roleInfo[form.role].text}>
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })} options={(Object.keys(roleInfo) as AdminRole[]).map((r) => ({ value: r, label: roleInfo[r].label }))} />
        </FieldShell>
        {!user && (
          <FieldShell label="Temporary password" required help="At least 8 characters with letters and numbers. Share it securely.">
            <Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FieldShell>
        )}
      </form>
    </Modal>
  );
}

export function UsersManager() {
  const { user: me, isOwner, refreshUser } = useAdmin();
  const toast = useToast();
  const params = useSearchParams();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [userModal, setUserModal] = useState(false);
  const [pwUser, setPwUser] = useState<AdminUser | null>(null);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);

  const load = useCallback(() => services.auth.listUsers().then(setUsers), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (params?.get('me')) setPwUser(me); }, [params, me]);

  const close = () => { setUserModal(false); setEditUser(null); load(); refreshUser(); };

  return (
    <div>
      <PageHeader title="Admin users" description="Who can sign in to this dashboard and what they can do."
        actions={<>
          <Button variant="secondary" icon={KeyRound} onClick={() => setPwUser(me)}>Change my password</Button>
          {isOwner && <Button icon={Plus} onClick={() => { setEditUser(null); setUserModal(true); }}>Add user</Button>}
        </>} />
      {me.usingDefaultPassword && (
        <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 flex items-start gap-3">
          <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="flex-1">You’re still using the default password. Change it now.</span>
          <Button size="sm" variant="dark" onClick={() => setPwUser(me)}>Change</Button>
        </div>
      )}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
        <Card>
          {!users ? <div className="p-5 space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : users.length === 0 ? <EmptyState icon={ShieldCheck} title="No users" /> : (
            <ul className="divide-y divide-[#F2F5F4]">
              {users.map((u) => (
                <li key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#168F88] to-[#8B80F9] text-white text-xs font-bold flex items-center justify-center shrink-0">{u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name} {u.id === me.id && <span className="text-xs text-[#8A9496] font-medium">(you)</span>}</p>
                      <p className="text-xs text-[#8A9496] truncate">{u.email} · last sign-in {timeAgo(u.lastLoginAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={roleInfo[u.role].tone}>{roleInfo[u.role].label}</Badge>
                    {!u.active && <Badge tone="red">Deactivated</Badge>}
                    {isOwner && (
                      <div className="flex">
                        <button type="button" onClick={() => { setEditUser(u); setUserModal(true); }} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label="Edit user"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setPwUser(u)} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label="Set password"><KeyRound className="w-4 h-4" /></button>
                        {u.id !== me.id && (
                          <button type="button" onClick={async () => { try { await services.auth.updateUser(u.id, { active: !u.active }); toast.success(u.active ? 'User deactivated' : 'User re-activated'); load(); } catch (e) { toast.error('Could not update', e); } }} className="p-2 rounded-lg text-[#8A9496] hover:bg-slate-100" aria-label={u.active ? 'Deactivate' : 'Activate'}>
                            {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                        {u.id !== me.id && <button type="button" onClick={() => setToDelete(u)} className="p-2 rounded-lg text-[#8A9496] hover:text-[#E5484D] hover:bg-red-50" aria-label="Delete user"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5 space-y-4 self-start">
          <h3 className="text-[15px] font-bold font-heading">Roles</h3>
          {(Object.keys(roleInfo) as AdminRole[]).map((r) => (
            <div key={r}><Badge tone={roleInfo[r].tone}>{roleInfo[r].label}</Badge><p className="text-xs text-[#6B7678] mt-1.5">{roleInfo[r].text}</p></div>
          ))}
          <p className="text-[11px] text-[#A3ACAE] border-t border-[#EDF2F1] pt-3">Accounts are stored in {STORAGE_BACKEND.toLowerCase()}. Server-side accounts arrive with the database integration.</p>
        </Card>
      </div>
      <UserModal open={userModal} onClose={close} user={editUser} />
      <PasswordModal open={!!pwUser} user={pwUser} onClose={() => { setPwUser(null); refreshUser(); load(); }} />
      <ConfirmDialog open={!!toDelete} onCancel={() => setToDelete(null)} title="Delete admin user?" message={<><b>{toDelete?.name}</b> will no longer be able to sign in.</>}
        onConfirm={async () => { try { await services.auth.deleteUser(toDelete!.id); toast.success('User deleted'); } catch (e) { toast.error('Could not delete', e); } setToDelete(null); load(); }} />
    </div>
  );
}

export function SettingsPage() {
  const { isOwner } = useAdmin();
  const toast = useToast();
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(null);
  const [confirm, setConfirm] = useState<'' | 'clear' | 'reset'>('');
  const [busy, setBusy] = useState('');
  useEffect(() => { services.settings.storageEstimate().then(setUsage).catch(() => {}); }, []);

  return (
    <div className="space-y-8">
      <GeneralSettingsEditor />
      <div>
        <h2 className="text-lg font-bold font-heading mb-3">Data & storage</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader icon={Database} title="Where data is stored" subtitle={STORAGE_BACKEND} />
            <div className="px-5 sm:px-6 pb-6 pt-3 space-y-3 text-sm text-[#4B5759]">
              <p>Content, media, applications and admin accounts are saved in <b>this browser profile</b>. Other devices and visitors’ browsers don’t see them yet – the website falls back to its built-in content there.</p>
              <p className="text-xs text-[#8A9496]">Next phase: MongoDB for data and Cloudinary for media. The dashboard already uses swappable service adapters, so no screens change.</p>
              {usage && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1"><span>Browser storage used</span><span>{formatBytes(usage.usage)} of {formatBytes(usage.quota)}</span></div>
                  <div className="h-1.5 rounded-full bg-[#EDF1F0] overflow-hidden"><div className="h-full bg-[#168F88] rounded-full" style={{ width: `${Math.min(100, (usage.usage / Math.max(1, usage.quota)) * 100)}%` }} /></div>
                </div>
              )}
              <Button variant="secondary" icon={Download} onClick={async () => {
                const data = await services.settings.exportAll();
                downloadFile(`meero-cms-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
                toast.success('Backup downloaded', 'Uploaded files and CVs are not included in the JSON.');
              }}>Download backup (JSON)</Button>
            </div>
          </Card>
          <Card>
            <CardHeader icon={Sparkles} title="Sample records" subtitle="Demo applications and enquiries marked “Sample”." />
            <div className="px-5 sm:px-6 pb-6 pt-3 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={!isOwner} loading={busy === 'seed'} onClick={async () => { setBusy('seed'); await services.settings.seedSampleData(); setBusy(''); toast.success('Sample records loaded'); }}>Load sample records</Button>
              <Button variant="secondary" disabled={!isOwner} onClick={() => setConfirm('clear')}>Remove sample records</Button>
            </div>
            <div className="mx-5 sm:mx-6 mb-6 rounded-2xl border border-red-200 bg-red-50/60 p-4">
              <p className="text-sm font-bold text-[#c23b40]">Reset everything</p>
              <p className="text-xs text-[#8a3a3d] mt-1">Deletes all CMS content, media, applications, enquiries and admin users stored in this browser. The website returns to its original content.</p>
              <Button size="sm" variant="danger" className="mt-3" disabled={!isOwner} onClick={() => setConfirm('reset')}>Reset all data</Button>
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog open={confirm === 'clear'} onCancel={() => setConfirm('')} loading={busy === 'clear'} title="Remove sample records?" message="Only records marked “Sample” are deleted. Real submissions stay." confirmLabel="Remove samples"
        onConfirm={async () => { setBusy('clear'); const n = await services.settings.clearSampleData(); setBusy(''); setConfirm(''); toast.success(`${n} sample record${n === 1 ? '' : 's'} removed`); }} />
      <ConfirmDialog open={confirm === 'reset'} onCancel={() => setConfirm('')} loading={busy === 'reset'} title="Reset all data?" requireText="RESET" confirmLabel="Reset everything"
        message="This cannot be undone. Download a backup first if you need one. You will be signed out."
        onConfirm={async () => { setBusy('reset'); await services.settings.resetEverything(); window.location.href = '/admin/login'; }} />
    </div>
  );
}
