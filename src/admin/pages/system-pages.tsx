'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, TriangleAlert, UserX, UserCheck } from 'lucide-react';
import { services, STORAGE_BACKEND, type AdminRole, type AdminUser } from '../../lib/services';
import { useAdmin } from '../context';
import { Badge, Button, Card, ConfirmDialog, EmptyState, FieldShell, Input, Modal, PageHeader, Select, Skeleton, timeAgo } from '../ui/kit';
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
        <Card data-tour="admin-users">
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
  return <GeneralSettingsEditor />;
}
