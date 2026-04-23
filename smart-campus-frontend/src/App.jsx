import { useEffect, useMemo, useState } from 'react';
import { apiClient } from './api/client';
import { Bell, Users, PlusCircle, CheckCircle, Info, AlertTriangle, XOctagon, LogOut, LayoutDashboard, ShieldAlert, BarChart3, PieChart, Activity, TrendingUp } from 'lucide-react';

const OAUTH_SUCCESS_PATH = '/oauth/success';
const OAUTH_ENTRY_URL = import.meta.env.VITE_OAUTH_ENTRY_URL ?? 'http://localhost:8080/oauth2/authorization/google';

const roleOptions = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT', 'ROLE_TECHNICIAN'];
const notificationTypes = ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'];

import bgImage from '../Gemini_Generated_Image_xom0dcxom0dcxom0 (2).png';
import dashboardBg from './assets/dashboard-bg.png';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const [adminLogin, setAdminLogin] = useState({ email: '', password: '' });
  const [isLoginViewAdmin, setIsLoginViewAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiClient.post('/public/auth/dev-login', {
        email: adminLogin.email,
        password: adminLogin.password
      });
      localStorage.setItem('campus_access_token', response.data.token);
      initializeApp();
    } catch (err) {
      setError('Invalid admin credentials.');
    }
  };


  const [notificationForm, setNotificationForm] = useState({
    recipientEmail: '',
    title: '',
    message: '',
    type: 'INFO'
  });

  const canCreateNotifications = useMemo(
    () => user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF',
    [user]
  );

  const canManageRoles = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.pathname === OAUTH_SUCCESS_PATH) {
      const token = currentUrl.searchParams.get('token');
      if (token) {
        localStorage.setItem('campus_access_token', token);
      }
      window.history.replaceState({}, document.title, '/');
    }

    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      const meResponse = await apiClient.get('/me');
      setUser(meResponse.data);
      await Promise.all([loadNotifications(), loadUsersIfAdmin(meResponse.data.role)]);
      setError('');
    } catch (err) {
      localStorage.removeItem('campus_access_token');
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
      setUsers([]);
      if (err?.response?.status && err.response.status !== 401) {
        setError('Unable to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    const response = await apiClient.get('/notifications');
    setNotifications(response.data.notifications);
    setUnreadCount(response.data.unreadCount);
  };

  const loadUsersIfAdmin = async (role) => {
    if (role !== 'ROLE_ADMIN') {
      return;
    }
    const response = await apiClient.get('/admin/users');
    setUsers(response.data);
  };

  const logout = () => {
    localStorage.removeItem('campus_access_token');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setUsers([]);
  };

  const markRead = async (notificationId, read) => {
    await apiClient.patch(`/notifications/${notificationId}/read?read=${read}`);
    await loadNotifications();
  };

  const submitNotification = async (event) => {
    event.preventDefault();
    await apiClient.post('/notifications', notificationForm);
    setNotificationForm({
      recipientEmail: '',
      title: '',
      message: '',
      type: 'INFO'
    });
    await loadNotifications();
  };

  const updateUserRole = async (email, role) => {
    await apiClient.patch(`/admin/users/${encodeURIComponent(email)}/role`, { role });
    await loadUsersIfAdmin('ROLE_ADMIN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-deep relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-1/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/20 rounded-full blur-[100px]" />
        </div>
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-16 h-16 border-4 border-white/10 border-t-accent-1 rounded-full animate-spin"></div>
          <p className="text-gray-300 animate-pulse text-lg font-heading tracking-wide">Initializing Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.7), rgba(10, 10, 10, 0.8)), url("${bgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="glass-card w-full max-w-[480px] text-center px-9 py-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-1 to-transparent"></div>
          <p className="inline-block mb-3 uppercase tracking-widest text-xs text-accent-1 font-bold">Smart Campus Operations Hub</p>
          <h1 className="text-4xl mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Secure Access Portal</h1>

          <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-8 mt-6 w-full border border-white/5">
            <button
              onClick={() => { setIsLoginViewAdmin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLoginViewAdmin ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Standard Staff
            </button>
            <button
              onClick={() => { setIsLoginViewAdmin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLoginViewAdmin ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Gateway
            </button>
          </div>

          {!isLoginViewAdmin ? (
            <div className="animate-fade-in">
              <p className="text-gray-400">Use your institutional Google account to continue.</p>
              <a className="w-full mt-6 bg-white text-gray-900 py-3.5 px-5 text-base shadow-[0_4px_15px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] hover:bg-gray-50 flex items-center justify-center gap-3 rounded-xl font-semibold transition-all" href={OAUTH_ENTRY_URL}>
                <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </a>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="animate-fade-in text-left flex flex-col gap-4 mt-2">
              <label className="text-gray-300">
                Admin Email
                <input
                  type="email"
                  required
                  placeholder="admin@smartcampus.com"
                  value={adminLogin.email}
                  onChange={e => setAdminLogin({ ...adminLogin, email: e.target.value })}
                  className="mt-1"
                />
              </label>
              <label className="text-gray-300 block">
                Password
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={adminLogin.password}
                    onChange={e => setAdminLogin({ ...adminLogin, password: e.target.value })}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              <button type="submit" className="btn btn-primary mt-2 w-full py-3.5">
                Admin Sign In
              </button>
            </form>
          )}

          {error ? <p className="text-red-400 mt-6 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p> : null}
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="text-green-400 w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="text-yellow-400 w-5 h-5" />;
      case 'CRITICAL': return <XOctagon className="text-red-400 w-5 h-5" />;
      default: return <Info className="text-blue-400 w-5 h-5" />;
    }
  };

  return (
    <div
      className="min-h-screen text-gray-100 flex overflow-hidden relative"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.85), rgba(10, 10, 10, 0.95)), url("${dashboardBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-1/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-2/20 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-[280px] hidden md:flex flex-col border-r border-panel-border bg-black/40 backdrop-blur-xl z-10 p-6 relative">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center shadow-lg shadow-accent-1/20">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Operations Hub</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Smart Campus</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-1/10 text-accent-1 font-medium transition-colors border border-accent-1/20">
            <Bell className="w-5 h-5" />
            Dashboard
          </button>
          {canManageRoles && (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-colors">
              <ShieldAlert className="w-5 h-5" />
              Role Management
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-panel-border">
          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600">
              <span className="font-bold text-sm">{user.fullName.charAt(0)}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm text-white truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10 scroll-smooth">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-panel-border bg-black/40 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
              <LayoutDashboard className="text-white w-4 h-4" />
            </div>
            <h1 className="font-heading font-bold text-base">Ops Hub</h1>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-[1200px] w-full mx-auto animate-fade-in space-y-8">

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-1/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Unread Alerts</p>
                  <h3 className="text-4xl font-heading font-bold text-white">{unreadCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-1/10 flex items-center justify-center border border-accent-1/20 text-accent-1">
                  <Bell className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-card relative overflow-hidden group md:col-span-2 flex items-center justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <h2 className="text-2xl font-heading font-semibold text-white mb-1">Welcome back, {user.fullName.split(' ')[0]}</h2>
                <p className="text-gray-400 text-sm">Here's what's happening across the campus today.</p>
              </div>
              <div className="hidden sm:block">
                <div className="px-4 py-2 rounded-full border border-accent-2/30 bg-accent-2/10 text-accent-2 text-sm font-bold tracking-wide uppercase">
                  {user.role.replace('ROLE_', '')}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-semibold text-sm">System Error</h4>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
                <p className="text-red-300/60 text-xs mt-2">Note: Please ensure the backend server has connected to MongoDB Atlas.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Notifications Feed */}
            <section className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                  Activity Feed
                  <span className="bg-white/10 text-xs px-2.5 py-0.5 rounded-full text-gray-300 font-medium">{notifications.length}</span>
                </h3>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 && !error && (
                  <div className="glass-card flex flex-col items-center justify-center py-16 text-center border-dashed">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-500">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-1">All caught up</h4>
                    <p className="text-gray-400 text-sm max-w-[250px]">You don't have any new notifications at the moment.</p>
                  </div>
                )}

                {notifications.map((item) => (
                  <div key={item.id} className={`group relative p-5 rounded-2xl border transition-all duration-300 ${item.isRead ? 'bg-panel-light border-panel-border opacity-70' : 'bg-white/10 border-white/20 shadow-lg shadow-black/20'}`}>
                    {/* Unread dot */}
                    {!item.isRead && <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-accent-1 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}

                    <div className="flex gap-4 sm:gap-5 items-start">
                      <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.isRead ? 'bg-black/20' : 'bg-black/40 border border-white/5 shadow-inner'}`}>
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                          <h4 className={`text-base truncate font-medium ${item.isRead ? 'text-gray-300' : 'text-white'}`}>{item.title}</h4>
                          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${item.isRead ? 'text-gray-500' : 'text-gray-300'}`}>{item.message}</p>

                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            className="text-xs font-semibold uppercase tracking-wider text-accent-1 hover:text-white transition-colors"
                            onClick={() => markRead(item.id, !item.isRead)}
                          >
                            {item.isRead ? 'Mark as unread' : 'Mark as read'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right Sidebar Columns */}
            <div className="space-y-8">
              {canCreateNotifications && (
                <section className="glass-card relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-1 to-accent-2" />
                  <h3 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-accent-1" />
                    Broadcast
                  </h3>
                  <form className="space-y-4" onSubmit={submitNotification}>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Recipient Email</label>
                      <input
                        type="email"
                        placeholder="user@smartcampus.com"
                        value={notificationForm.recipientEmail}
                        onChange={(e) => setNotificationForm(c => ({ ...c, recipientEmail: e.target.value }))}
                        required
                        className="bg-black/30 border-white/5 focus:border-accent-1/50 focus:bg-black/50 text-sm placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
                      <input
                        placeholder="Subject of notification"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm(c => ({ ...c, title: e.target.value }))}
                        required
                        className="bg-black/30 border-white/5 focus:border-accent-1/50 focus:bg-black/50 text-sm placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message</label>
                      <textarea
                        rows={3}
                        placeholder="Type your message here..."
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm(c => ({ ...c, message: e.target.value }))}
                        required
                        className="bg-black/30 border-white/5 focus:border-accent-1/50 focus:bg-black/50 text-sm resize-none placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm(c => ({ ...c, type: e.target.value }))}
                        className="bg-black/30 border-white/5 focus:border-accent-1/50 focus:bg-black/50 text-sm"
                      >
                        {notificationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-2 py-3 text-sm">
                      Send Notification
                    </button>
                  </form>
                </section>
              )}

              {canManageRoles && (
                <section className="glass-card">
                  <h3 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-2" />
                    Access Control
                  </h3>
                  <div className="space-y-3">
                    {users.map((profile) => (
                      <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 hover:bg-black/40 transition-colors" key={profile.email}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-medium text-white truncate">{profile.fullName}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5"><span className="text-gray-500">Username:</span> {profile.email}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider"><span className="text-gray-600 font-bold">DOB:</span> {profile.birthday || 'N/A'}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider"><span className="text-gray-600 font-bold">Assigned:</span> {profile.assignedDate || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <select
                          value={profile.role}
                          onChange={(e) => updateUserRole(profile.email, e.target.value)}
                          className="w-full py-2 px-3 text-xs font-medium uppercase tracking-wider bg-black/40 border-white/10 text-gray-300"
                        >
                          {roleOptions.map(role => (
                            <option key={role} value={role}>{role.replace('ROLE_', '')}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {users.length === 0 && !error && (
                      <p className="text-sm text-gray-500 italic text-center py-4">No users loaded.</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
