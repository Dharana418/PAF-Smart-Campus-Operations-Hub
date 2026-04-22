import { useEffect, useMemo, useState } from 'react';
import { apiClient } from './api/client';

const OAUTH_SUCCESS_PATH = '/oauth/success';
const OAUTH_ENTRY_URL = import.meta.env.VITE_OAUTH_ENTRY_URL ?? 'http://localhost:8080/oauth2/authorization/google';

const roleOptions = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'];
const notificationTypes = ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'];

import bgImage from '../Gemini_Generated_Image_xom0dcxom0dcxom0 (2).png';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  
  const [adminLogin, setAdminLogin] = useState({ email: '', password: '' });
  const [isLoginViewAdmin, setIsLoginViewAdmin] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-400 animate-pulse text-lg">Loading smart campus workspace...</p>
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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
                  onChange={e => setAdminLogin({...adminLogin, email: e.target.value})}
                  className="mt-1"
                />
              </label>
              <label className="text-gray-300">
                Password
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={adminLogin.password}
                  onChange={e => setAdminLogin({...adminLogin, password: e.target.value})}
                  className="mt-1"
                />
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

  return (
    <main className="max-w-[1200px] mx-auto p-6 md:p-8 grid gap-6 animate-fade-in">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-br from-[#141414cc] to-[#0a0a0acc] p-6 rounded-[20px] border border-panel-border shadow-lg backdrop-blur-md">
        <div>
          <p className="inline-block mb-2 uppercase tracking-widest text-xs text-accent-1 font-bold">Operations Workspace</p>
          <h2 className="text-3xl font-semibold bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent">{user.fullName}</h2>
          <p className="text-gray-400 mt-1">{user.email} | <span className="text-white font-medium">{user.role}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <p className="m-0 text-sm font-semibold bg-white/5 border border-white/10 rounded-full px-4 py-2 text-gray-100 shadow-inner">
            Unread: <span className="text-accent-1">{unreadCount}</span>
          </p>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="glass-card lg:col-span-2 min-h-[480px]">
          <h3 className="text-2xl mb-2">Notifications</h3>
          <div className="mt-5 grid gap-4">
            {notifications.length === 0 ? <p className="text-gray-400 italic">No notifications yet. You're all caught up!</p> : null}
            {notifications.map((item) => (
              <div key={item.id} className={`bg-white/5 border border-panel-border border-l-4 border-l-accent-1 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4 sm:items-start transition-all duration-300 hover:bg-white/10 ${item.isRead ? 'opacity-60 border-l-white/10 grayscale-[50%]' : ''}`}>
                <div>
                  <p className="inline-flex mb-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 text-xs rounded-full uppercase font-bold tracking-wider">{item.type}</p>
                  <h4 className="text-lg mb-1 text-white">{item.title}</h4>
                  <p className="text-gray-300 mb-3 leading-relaxed">{item.message}</p>
                  <small className="text-gray-500 block">{new Date(item.createdAt).toLocaleString()}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary whitespace-nowrap self-start sm:self-auto"
                  onClick={() => markRead(item.id, !item.isRead)}
                >
                  {item.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
            ))}
          </div>
        </article>

        {canCreateNotifications ? (
          <article className="glass-card lg:col-span-1 h-fit">
            <h3 className="text-2xl mb-2">Broadcast</h3>
            <form className="grid gap-5 mt-5" onSubmit={submitNotification}>
              <label>
                Recipient Email
                <input
                  type="email"
                  placeholder="user@smartcampus.com"
                  value={notificationForm.recipientEmail}
                  onChange={(event) =>
                    setNotificationForm((current) => ({ ...current, recipientEmail: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Title
                <input
                  placeholder="Subject of notification"
                  value={notificationForm.title}
                  onChange={(event) =>
                    setNotificationForm((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Message
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  value={notificationForm.message}
                  onChange={(event) =>
                    setNotificationForm((current) => ({ ...current, message: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Priority
                <select
                  value={notificationForm.type}
                  onChange={(event) =>
                    setNotificationForm((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" className="btn btn-primary mt-2">Send Notification</button>
            </form>
          </article>
        ) : null}
      </section>

      {canManageRoles ? (
        <section className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl">Role Management</h3>
            <span className="bg-accent-2/20 text-accent-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-accent-2/30">Admin Access</span>
          </div>
          <p className="text-gray-400 mb-6 max-w-2xl">Manage user roles across the platform. Changes are saved automatically and applied immediately.</p>
          
          <div className="mt-5 grid gap-3">
            <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1fr] gap-4 items-center font-semibold text-gray-400 px-4 pb-2 text-sm uppercase tracking-wide">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
            </div>
            {users.map((profile) => (
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr] gap-3 md:gap-4 items-center p-4 rounded-2xl bg-white/5 border border-panel-border transition-all hover:bg-white/10" key={profile.email}>
                <div className="flex flex-col">
                  <span className="md:hidden text-xs text-gray-500 uppercase font-bold mb-1">Name</span>
                  <span className="text-white font-medium">{profile.fullName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="md:hidden text-xs text-gray-500 uppercase font-bold mb-1">Email</span>
                  <span className="text-gray-300">{profile.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="md:hidden text-xs text-gray-500 uppercase font-bold mb-1">Role</span>
                  <select
                    value={profile.role}
                    onChange={(event) => updateUserRole(profile.email, event.target.value)}
                    className="py-2 px-3"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default App;
