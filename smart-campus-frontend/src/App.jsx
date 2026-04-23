import { useEffect, useMemo, useState } from 'react';
import { apiClient } from './api/client';
import { 
  Users, 
  Shield, 
  Bell, 
  Search, 
  RefreshCw, 
  PieChart as PieChartIcon, 
  Layout, 
  Activity, 
  TrendingUp,
  Mail,
  Lock,
  ArrowRight,
  PlusCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XOctagon, 
  LogOut, 
  LayoutDashboard, 
  ShieldAlert, 
  BarChart3, 
  PieChart as PieIcon 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import RoleManagementPage from './components/RoleManagementPage';

const OAUTH_SUCCESS_PATH = '/oauth/success';
const OAUTH_ENTRY_URL = import.meta.env.VITE_OAUTH_ENTRY_URL ?? 'http://localhost:8080/oauth2/authorization/google';

const roleOptions = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'];
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
  const [activePage, setActivePage] = useState('dashboard');

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

  const updateUserRole = async (email, newRole) => {
    try {
      const resp = await apiClient.patch(`/admin/users/${email}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.email === email ? resp.data : u));
    } catch (err) {
      console.error('Role update failed:', err);
      setError('Failed to update role.');
    }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      await apiClient.delete(`/admin/users/${email}`);
      setUsers(prev => prev.filter(u => u.email !== email));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete user.');
    }
  };

  const updateProfile = async (email, data) => {
    try {
      const resp = await apiClient.put(`/admin/users/${email}`, data);
      setUsers(prev => prev.map(u => u.email === email ? resp.data : u));
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Failed to update profile.');
    }
  };

  const registerUser = async (data) => {
    try {
      const resp = await apiClient.post('/admin/users', data);
      setUsers(prev => [resp.data, ...prev]);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to register user.');
      throw err;
    }
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
        <div className="bg-white/95 backdrop-blur-3xl w-full max-w-[480px] text-center px-9 py-12 relative overflow-hidden rounded-[40px] shadow-2xl border border-white/20">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-1 to-transparent"></div>
          <p className="inline-block mb-3 uppercase tracking-[0.3em] text-xs text-accent-1 font-black">Smart Campus Operations Hub</p>
          <h1 className="text-5xl mb-6 font-black text-gray-900 uppercase tracking-tighter">Secure Access Portal</h1>

          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 mt-6 w-full border border-gray-200">
            <button
              onClick={() => { setIsLoginViewAdmin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLoginViewAdmin ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Standard Staff
            </button>
            <button
              onClick={() => { setIsLoginViewAdmin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLoginViewAdmin ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Admin Gateway
            </button>
          </div>

          {!isLoginViewAdmin ? (
            <div className="animate-fade-in">
              <p className="text-gray-600 font-medium">Use your institutional Google account to continue.</p>
              <a className="w-full mt-6 bg-white text-gray-900 py-3.5 px-5 text-base shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:bg-gray-50 flex items-center justify-center gap-3 rounded-xl font-bold transition-all border border-gray-100" href={OAUTH_ENTRY_URL}>
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
            <div className="animate-fade-in flex flex-col gap-4 mt-2">
              <form onSubmit={handleAdminLogin} className="text-left flex flex-col gap-4">
                <label className="text-gray-900 font-black text-xs uppercase tracking-widest mb-1">
                  Admin Email
                  <input
                    type="email"
                    required
                    placeholder="admin@smartcampus.com"
                    value={adminLogin.email}
                    onChange={e => setAdminLogin({ ...adminLogin, email: e.target.value })}
                    className="mt-2 !bg-gray-50 !border-gray-200 !text-gray-900 !placeholder-gray-400 font-black"
                  />
                </label>
                <label className="text-gray-900 font-black text-xs uppercase tracking-widest block mb-1">
                  Password
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={adminLogin.password}
                      onChange={e => setAdminLogin({ ...adminLogin, password: e.target.value })}
                      className="w-full pr-10 !bg-white !border-gray-200 !text-gray-900 !placeholder-gray-400 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                <button type="submit" className="btn btn-primary mt-2 w-full py-3.5 font-black uppercase tracking-wider">
                  Admin Sign In
                </button>
              </form>
              
              <div className="flex items-center gap-4 my-2">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">OR</span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>

              <a className="w-full bg-white border-2 border-gray-100 text-gray-900 py-4 px-5 text-sm hover:bg-gray-50 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl" href={OAUTH_ENTRY_URL}>
                <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </a>
            </div>
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
        backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.85), rgba(10, 10, 10, 0.95)), url("${bgImage}")`,
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
      <aside className="w-[280px] hidden md:flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl z-10 p-6 relative">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center shadow-lg shadow-accent-1/20">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xl leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase tracking-tighter">Operations Hub</h1>
            <p className="text-[10px] text-accent-1 uppercase tracking-[0.2em] font-black">Smart Campus</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs transition-colors ${
              activePage === 'dashboard'
                ? 'bg-accent-1 text-white shadow-[0_8px_20px_rgba(59,130,246,0.4)]'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5" />
            Dashboard
          </button>
          {canManageRoles && (
            <button
              onClick={() => setActivePage('roles')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs transition-colors ${
                activePage === 'roles'
                  ? 'bg-accent-2 text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              Role Management
              {users.length > 0 && (
                <span className="ml-auto bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{users.length}</span>
              )}
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${canManageRoles ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  {canManageRoles ? 'System Admin' : 'Staff Member'}
                </p>
              </div>
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
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
              <LayoutDashboard className="text-white w-4 h-4" />
            </div>
            <h1 className="font-heading font-bold text-base text-white">Ops Hub</h1>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-[1200px] w-full mx-auto space-y-8">

          {activePage === 'roles' && canManageRoles ? (
            <RoleManagementPage
              users={users}
              onUpdateRole={updateUserRole}
              onDeleteUser={deleteUser}
              onUpdateProfile={updateProfile}
              onRegisterUser={registerUser}
              onRefresh={() => loadUsersIfAdmin('ROLE_ADMIN')}
              currentUserEmail={user.email}
              adminWhitelist={[
                'admin@smartcampus.com',
                'thiyunuwan567@gmail.com',
                'dharana.thilakarahena@gmail.com'
              ]}
            />
          ) : (<>
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-1/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Unread Alerts</p>
                  <h3 className="text-5xl font-heading font-black text-gray-900">{unreadCount}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-accent-1 text-white flex items-center justify-center shadow-lg">
                  <Bell className="w-7 h-7" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-2xl relative overflow-hidden group md:col-span-2 flex items-center justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <h2 className="text-3xl font-heading font-black text-gray-900 mb-1 uppercase tracking-tighter">Command Center</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Welcome back, {user.fullName}</p>
              </div>
              <div className="hidden sm:block">
                <div className="px-6 py-3 rounded-full bg-accent-2 text-white text-xs font-black tracking-[0.2em] uppercase shadow-lg">
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
            <section className="xl:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-heading font-black flex items-center gap-4 text-white uppercase tracking-tighter">
                  Activity Logs
                  <span className="bg-white/20 text-[11px] px-4 py-1.5 rounded-full text-white font-black border-2 border-white/10 shadow-lg">{notifications.length}</span>
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
                  <div key={item.id} className={`group relative p-6 rounded-3xl border transition-all duration-300 ${item.isRead ? 'bg-white/40 border-gray-200 opacity-60' : 'bg-white/95 border-white shadow-2xl shadow-black/20'}`}>
                    {/* Unread dot */}
                    {!item.isRead && <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-accent-1 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}

                    <div className="flex gap-5 items-start">
                      <div className={`mt-1 shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${item.isRead ? 'bg-gray-200' : 'bg-accent-1 text-white shadow-lg'}`}>
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                          <h4 className={`text-lg truncate font-black tracking-tight ${item.isRead ? 'text-gray-500' : 'text-gray-900'}`}>{item.title}</h4>
                          <span className="text-[10px] text-accent-1 font-black uppercase tracking-[0.2em]">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className={`text-sm leading-relaxed font-black ${item.isRead ? 'text-gray-400' : 'text-gray-800'}`}>{item.message}</p>

                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-1 hover:text-accent-2 transition-colors"
                            onClick={() => markRead(item.id, !item.isRead)}
                          >
                            {item.isRead ? 'Mark as active' : 'Archive Entry'}
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
                <section className="bg-white/95 backdrop-blur-2xl p-7 rounded-[32px] border border-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-1 to-accent-2" />
                  <h3 className="text-xl font-heading font-black mb-6 flex items-center gap-3 text-gray-900 uppercase tracking-tighter">
                    <TrendingUp className="w-6 h-6 text-accent-1" />
                    Global Broadcast
                  </h3>
                  <form className="space-y-4" onSubmit={submitNotification}>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Recipient Email</label>
                      <input
                        type="email"
                        placeholder="user@smartcampus.com"
                        value={notificationForm.recipientEmail}
                        onChange={(e) => setNotificationForm(c => ({ ...c, recipientEmail: e.target.value }))}
                        required
                        className="!bg-gray-50 !border-gray-200 !text-gray-900 !placeholder-gray-400 font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Title</label>
                      <input
                        placeholder="Subject of notification"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm(c => ({ ...c, title: e.target.value }))}
                        required
                        className="!bg-gray-50 !border-gray-200 !text-gray-900 !placeholder-gray-400 font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Message</label>
                      <textarea
                        rows={3}
                        placeholder="Type your message here..."
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm(c => ({ ...c, message: e.target.value }))}
                        required
                        className="!bg-gray-50 !border-gray-200 !text-gray-900 !placeholder-gray-400 font-black resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Priority</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm(c => ({ ...c, type: e.target.value }))}
                        className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black"
                      >
                        {notificationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4 py-4 text-xs font-black uppercase tracking-widest shadow-xl">
                      Send Notification
                    </button>
                  </form>
                </section>
              )}

              {canManageRoles && (
                <>
                  {/* Advanced Analytics Section */}
                  <section className="bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-2xl space-y-8">
                  <div>
                    <h3 className="text-xl font-black mb-1 flex items-center gap-3 text-gray-900 uppercase tracking-tighter">
                      <TrendingUp className="w-6 h-6 text-accent-1" />
                      Campus Activity
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Real-time system interaction metrics</p>
                  </div>

                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Mon', value: 400 },
                        { name: 'Tue', value: 300 },
                        { name: 'Wed', value: 600 },
                        { name: 'Thu', value: 800 },
                        { name: 'Fri', value: 500 },
                        { name: 'Sat', value: 900 },
                        { name: 'Sun', value: 1100 },
                      ]}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                        />
                        <YAxis hide />
                        <ReTooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: '900'
                          }} 
                        />
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Peak Time</p>
                      <p className="text-2xl font-black text-gray-900">14:00</p>
                    </div>
                    <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Syncs</p>
                      <p className="text-2xl font-black text-gray-900">2.4k</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 uppercase tracking-tighter">
                      <PieChartIcon className="w-6 h-6 text-accent-2" />
                      Role Distribution
                    </h3>
                    <div className="h-[180px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Admin', value: users.filter(u => u.role === 'ROLE_ADMIN').length },
                              { name: 'Staff', value: users.filter(u => u.role === 'ROLE_STAFF').length },
                              { name: 'Students', value: users.filter(u => u.role === 'ROLE_STUDENT').length },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            <Cell fill="#3B82F6" />
                            <Cell fill="#10B981" />
                            <Cell fill="#F59E0B" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      {['Admin', 'Staff', 'Students'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                </>
              )}
            </div>
          </div>
          </>)}
        </div>
      </main>
    </div>
  );
}

export default App;
