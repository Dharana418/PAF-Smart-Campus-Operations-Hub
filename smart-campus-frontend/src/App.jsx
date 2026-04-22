import { useEffect, useMemo, useState } from 'react';
import { apiClient } from './api/client';

const OAUTH_SUCCESS_PATH = '/oauth/success';
const OAUTH_ENTRY_URL = import.meta.env.VITE_OAUTH_ENTRY_URL ?? 'http://localhost:8080/oauth2/authorization/google';

const roleOptions = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'];
const notificationTypes = ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'];

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
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
      <div className="screen-center">
        <p className="muted-text">Loading smart campus workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="screen-center login-shell">
        <div className="card login-card">
          <p className="badge">Smart Campus Operations Hub</p>
          <h1>Secure Access Portal</h1>
          <p className="muted-text">Use your institutional Google account to continue.</p>
          <a className="google-btn" href={OAUTH_ENTRY_URL}>
            Continue with Google
          </a>
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <main className="layout">
      <header className="topbar card">
        <div>
          <p className="badge">Operations Workspace</p>
          <h2>{user.fullName}</h2>
          <p className="muted-text">{user.email} | {user.role}</p>
        </div>
        <div className="topbar-right">
          <p className="pill">Unread: {unreadCount}</p>
          <button type="button" className="secondary-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="grid">
        <article className="card span-2">
          <h3>Notifications</h3>
          <div className="notification-list">
            {notifications.length === 0 ? <p className="muted-text">No notifications yet.</p> : null}
            {notifications.map((item) => (
              <div key={item.id} className={`notification-item ${item.isRead ? 'read' : 'unread'}`}>
                <div>
                  <p className="pill type-pill">{item.type}</p>
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => markRead(item.id, !item.isRead)}
                >
                  {item.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
            ))}
          </div>
        </article>

        {canCreateNotifications ? (
          <article className="card">
            <h3>Broadcast Notification</h3>
            <form className="form" onSubmit={submitNotification}>
              <label>
                Recipient Email
                <input
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

              <button type="submit" className="primary-btn">Send Notification</button>
            </form>
          </article>
        ) : null}
      </section>

      {canManageRoles ? (
        <section className="card">
          <h3>Role Management</h3>
          <div className="role-table">
            <div className="role-head">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
            </div>
            {users.map((profile) => (
              <div className="role-row" key={profile.email}>
                <span>{profile.fullName}</span>
                <span>{profile.email}</span>
                <select
                  value={profile.role}
                  onChange={(event) => updateUserRole(profile.email, event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default App;
