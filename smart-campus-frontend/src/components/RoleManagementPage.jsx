import { useState, useMemo } from 'react';
import { Users, Search, Filter, ChevronDown, Check, Shield, GraduationCap, Wrench, Star, X, RefreshCw, Trash2, Edit3, Save, PlusCircle, XOctagon } from 'lucide-react';

const roleOptions = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT', 'ROLE_TECHNICIAN'];

const roleConfig = {
  ROLE_ADMIN: {
    label: 'Admin',
    icon: Star,
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-700',
  },
  ROLE_STAFF: {
    label: 'Staff',
    icon: Shield,
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-700',
  },
  ROLE_STUDENT: {
    label: 'Student',
    icon: GraduationCap,
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
    dot: 'bg-green-500',
    gradient: 'from-green-500 to-green-700',
  },
  ROLE_TECHNICIAN: {
    label: 'Technician',
    icon: Wrench,
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    dot: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-700',
  },
};

function RoleBadge({ role }) {
  const cfg = roleConfig[role] || roleConfig.ROLE_STUDENT;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function Avatar({ name, role }) {
  const cfg = roleConfig[role] || roleConfig.ROLE_STUDENT;
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
      {initials}
    </div>
  );
}

function RoleDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const cfg = roleConfig[value] || roleConfig.ROLE_STUDENT;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${cfg.bg} ${cfg.text} ${cfg.border} hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>{cfg.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-48 backdrop-blur-xl">
          {roleOptions.map(role => {
            const c = roleConfig[role];
            const Icon = c.icon;
            return (
              <button
                key={role}
                onClick={() => { onChange(role); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left text-xs font-bold hover:bg-white/5 transition-all ${role === value ? c.text : 'text-gray-400'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${role === value ? c.bg : 'bg-white/5'}`}>
                  <Icon className={`w-3.5 h-3.5 ${role === value ? c.text : 'text-gray-500'}`} />
                </div>
                {c.label}
                {role === value && <Check className={`w-3.5 h-3.5 ml-auto ${c.text}`} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RoleManagementPage({ users, onUpdateRole, onDeleteUser, onUpdateProfile, onRegisterUser, onRefresh, currentUserEmail, adminWhitelist = [] }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [updating, setUpdating] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  
  const [editUser, setEditUser] = useState(null);
  const [deleteEmail, setDeleteEmail] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', birthday: '', assignedDate: '' });
  const [registerForm, setRegisterForm] = useState({ 
    fullName: '', 
    email: '', 
    role: 'ROLE_STUDENT', 
    birthday: '', 
    assignedDate: today 
  });

  const handleRoleChange = async (email, newRole) => {
    setUpdating(email);
    try {
      await onUpdateRole(email, newRole);
      setSuccessMsg(`Role synchronized for ${email}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmDelete = async () => {
    const email = deleteEmail;
    setDeleteEmail(null);
    setUpdating(email);
    try {
      await onDeleteUser(email);
      setSuccessMsg(`User ${email} removed from registry`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const startEdit = (profile) => {
    setEditUser(profile);
    setEditForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      birthday: profile.birthday || '',
      assignedDate: profile.assignedDate || ''
    });
  };

  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    const email = editUser.email;
    setEditUser(null);
    setUpdating(email);
    try {
      await onUpdateProfile(email, editForm);
      setSuccessMsg(`Profile synchronized for ${email}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Profile synchronization failed.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setRegisterForm({ ...registerForm, fullName: val });
  };

  const handleConfirmRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation: 20+ Age (Born 2006 or earlier)
    if (registerForm.birthday) {
      const birthYear = new Date(registerForm.birthday).getFullYear();
      if (birthYear > 2006) {
        setErrorMsg('Security Policy: Registry restricted to ages 20+ (Birth Year 2006 or earlier)');
        return;
      }
    }

    setUpdating(registerForm.email);
    try {
      await onRegisterUser(registerForm);
      setSuccessMsg(`New profile authorized for ${registerForm.email}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setRegisterForm({ fullName: '', email: '', role: 'ROLE_STUDENT', birthday: '', assignedDate: today });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setUpdating(null);
    }
  };


  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === 'ALL' || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  const roleCounts = useMemo(() => {
    const counts = { ALL: users.length };
    roleOptions.forEach(r => { counts[r] = users.filter(u => u.role === r).length; });
    return counts;
  }, [users]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Authoritative Registration Panel */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-[40px] border border-white shadow-2xl p-10 mb-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-accent-1 rounded-2xl shadow-lg shadow-accent-1/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Authoritative Registration</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Manually authorize and provision new campus identity entries</p>
          </div>
        </div>

        <form onSubmit={handleConfirmRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Full Identity Name</label>
            <input
              placeholder="e.g. Johnathan Doe"
              value={registerForm.fullName}
              onChange={handleNameChange}
              required
              className="!bg-gray-50 !border-gray-100 !text-gray-900 font-black h-14"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Institutional Email</label>
            <input
              type="email"
              placeholder="user@smartcampus.com"
              value={registerForm.email}
              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              className="!bg-gray-50 !border-gray-100 !text-gray-900 font-black h-14"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Access Level</label>
            <select
              value={registerForm.role}
              onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })}
              className="!bg-gray-50 !border-gray-100 !text-gray-900 font-black h-14"
            >
              {roleOptions.map(r => <option key={r} value={r}>{r.replace('ROLE_', '')}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Birth Date</label>
            <input
              type="date"
              value={registerForm.birthday}
              onChange={e => setRegisterForm({ ...registerForm, birthday: e.target.value })}
              className="!bg-gray-50 !border-gray-100 !text-gray-900 font-black h-14"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Registry Date</label>
            <input
              type="date"
              value={registerForm.assignedDate}
              readOnly
              className="!bg-gray-100 !border-gray-100 !text-gray-400 font-black h-14 cursor-not-allowed"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              <PlusCircle className="w-5 h-5" />
              Authorize New Entry
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            Campus Registry
          </h2>
          <p className="text-sm text-gray-400 font-black mt-1 uppercase tracking-widest text-[10px] opacity-80">System-wide user role synchronization and permissions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Registry
          </button>
        </div>
      </div>

      {/* Notifications toast */}
      <div className="fixed bottom-10 right-10 z-[100] space-y-4">
        {successMsg && (
          <div className="flex items-center gap-4 p-5 rounded-[24px] bg-white border-2 border-green-500 shadow-2xl animate-slide-up">
            <div className="p-2 bg-green-500 rounded-xl">
              <Check className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-900 font-black text-xs uppercase tracking-widest">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-4 p-5 rounded-[24px] bg-white border-2 border-red-500 shadow-2xl animate-slide-up">
            <div className="p-2 bg-red-500 rounded-xl">
              <XOctagon className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-900 font-black text-xs uppercase tracking-widest">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[{ key: 'ALL', label: 'Total Users', bg: 'bg-white', text: 'text-gray-900' },
          ...roleOptions.map(r => ({ key: r, ...roleConfig[r] }))
        ].map(({ key, label, bg, text }) => (
          <button
            key={key}
            onClick={() => setFilterRole(key)}
            className={`p-5 rounded-[24px] border transition-all text-left group relative overflow-hidden ${
              filterRole === key
                ? `${bg} ${text} border-transparent shadow-[0_15px_40px_rgba(0,0,0,0.3)] scale-[1.02]`
                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
            }`}
          >
            <div className={`text-4xl font-black ${filterRole === key ? text : 'text-white'}`}>
              {roleCounts[key] ?? 0}
            </div>
            <div className={`text-sm font-black mt-1 uppercase tracking-[0.1em] ${filterRole === key ? 'opacity-90' : 'text-gray-400 group-hover:text-gray-200'}`}>
              {label ?? (roleConfig[key]?.label + 's')}
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card !p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="!pl-10 !py-2.5 !text-sm !rounded-xl !bg-white/5 !border-white/10 !text-white !placeholder-gray-500 focus:!border-accent-1/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-accent-1 font-black uppercase tracking-widest">
          <Filter className="w-4 h-4" />
          <span>Showing {filtered.length} of {users.length} authenticated profiles</span>
        </div>
      </div>

      {/* User Registry Table */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-[40px] border border-white shadow-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-gray-100/50 border-b border-gray-100 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">
          <div className="col-span-4">Identity</div>
          <div className="col-span-2 hidden md:block">Auth System</div>
          <div className="col-span-2 hidden md:block">Metadata</div>
          <div className="col-span-2 hidden sm:block">Status</div>
          <div className="col-span-2 text-right sm:col-span-2">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No users match your search.</p>
            </div>
          )}
          {filtered.map((profile) => {
            const isMe = profile.email === currentUserEmail;
            const isUpdating = updating === profile.email;
            return (
              <div
                key={profile.email}
                className={`grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none ${isUpdating ? 'opacity-50' : ''}`}
              >
                {/* User info */}
                <div className="col-span-4 flex items-center gap-4 min-w-0">
                  <Avatar name={profile.fullName} role={profile.role} />
                  <div className="min-w-0">
                    <p className="text-base font-black text-gray-900 truncate flex items-center gap-3 uppercase tracking-tight">
                      {profile.fullName}
                      {isMe && <span className="text-[10px] bg-accent-1 text-white px-3 py-0.5 rounded-full font-black tracking-widest shadow-md">OWNER</span>}
                      {adminWhitelist.includes(profile.email.toLowerCase()) && (
                        <span className="text-[10px] bg-green-500 text-white px-3 py-0.5 rounded-full font-black tracking-widest shadow-md flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          VERIFIED ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 font-black truncate mt-1.5 tracking-widest uppercase">{profile.email}</p>
                  </div>
                </div>

                {/* Auth System */}
                <div className="col-span-2 hidden md:block">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${profile.provider === 'google' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {profile.provider || 'system'}
                  </span>
                </div>

                {/* Date info */}
                <div className="col-span-2 hidden md:block">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                    <span className="text-gray-500">Birth: </span>
                    {profile.birthday || <span className="italic text-gray-600">Pending</span>}
                  </p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-1.5">
                    <span className="text-gray-500">Registry: </span>
                    {profile.assignedDate || <span className="italic text-gray-600">Pending</span>}
                  </p>
                </div>

                {/* Current role badge */}
                <div className="col-span-2 hidden sm:block">
                  <RoleBadge role={profile.role} />
                </div>

                {/* Actions */}
                <div className="col-span-5 sm:col-span-2 flex justify-end items-center gap-3">
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <RoleDropdown
                        value={profile.role}
                        onChange={(newRole) => handleRoleChange(profile.email, newRole)}
                        disabled={isMe}
                      />
                      <div className="flex items-center gap-2 ml-2">
                        <button 
                          onClick={() => startEdit(profile)}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                          title="Update Profile"
                        >
                          <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => setDeleteEmail(profile.email)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm group"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Synchronize Profile" onClose={() => setEditUser(null)}>
          <form onSubmit={handleConfirmEdit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Full Name</label>
              <input
                value={editForm.fullName}
                onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                required
                className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Institutional Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                required
                className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Date of Birth</label>
              <input
                type="date"
                value={editForm.birthday}
                onChange={e => setEditForm({ ...editForm, birthday: e.target.value })}
                className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Registry Date</label>
              <input
                type="date"
                value={editForm.assignedDate}
                onChange={e => setEditForm({ ...editForm, assignedDate: e.target.value })}
                className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black"
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancel</button>
              <button type="submit" className="flex-1 px-6 py-3.5 bg-accent-1 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-accent-1/30 hover:-translate-y-0.5 transition-all">Sync Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteEmail && (
        <Modal title="Permanently Remove" onClose={() => setDeleteEmail(null)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <p className="text-gray-900 font-black text-lg mb-2">Are you absolutely sure?</p>
            <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
              This will permanently remove <span className="text-red-600">{deleteEmail}</span> from the campus registry. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteEmail(null)} className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Abort</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/30 hover:-translate-y-0.5 transition-all">Confirm Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
