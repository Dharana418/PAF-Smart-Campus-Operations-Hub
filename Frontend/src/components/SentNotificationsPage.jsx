import { useState, useEffect } from 'react';
import { 
  TrendingUp, Search, Filter, Trash2, Edit3, X, 
  CheckCircle, AlertTriangle, XOctagon, Info, 
  Send, Calendar, Clock, Globe, User
} from 'lucide-react';
import { apiClient } from '../api/client';

export default function SentNotificationsPage() {
  const [sentAlerts, setSentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [editingAlert, setEditingAlert] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', message: '', type: 'INFO' });

  useEffect(() => {
    loadSentAlerts();
  }, []);

  const loadSentAlerts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/notifications/sent');
      setSentAlerts(response.data);
    } catch (err) {
      setError('Failed to load transmission history.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this broadcast from history?')) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      setSentAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to remove transmission.');
    }
  };

  const startEdit = (alert) => {
    setEditingAlert(alert);
    setEditForm({ title: alert.title, message: alert.message, type: alert.type });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/notifications/${editingAlert.id}`, editingAlert.isBroadcast ? { ...editForm, isBroadcast: true } : { ...editForm, recipientEmail: editingAlert.recipientEmail });
      setSentAlerts(prev => prev.map(a => a.id === editingAlert.id ? response.data : a));
      setEditingAlert(null);
    } catch (err) {
      setError('Failed to update transmission.');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="text-green-600 w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="text-yellow-600 w-5 h-5" />;
      case 'CRITICAL': return <XOctagon className="text-red-600 w-5 h-5" />;
      default: return <Info className="text-blue-600 w-5 h-5" />;
    }
  };

  const filtered = sentAlerts.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Send className="w-8 h-8 text-accent-1" />
            Transmission History
          </h2>
          <p className="text-[10px] text-gray-900 font-black mt-2 uppercase tracking-[0.3em] opacity-80">
            Audit and manage system-wide alerts and targeted communications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card !p-2 flex items-center gap-3 px-4">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              placeholder="Search transmissions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="!bg-transparent !border-none !p-0 !text-sm !w-48 !font-black !text-gray-900"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/10 border-t-accent-1 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card !bg-white/10 border-dashed py-20 text-center">
          <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest">No Transmissions Found</h3>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">You haven't dispatched any system alerts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((alert) => (
            <div key={alert.id} className="glass-card !bg-white/95 hover:!bg-white group relative">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {getIcon(alert.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{alert.title}</h3>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${alert.isBroadcast ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                      {alert.isBroadcast ? 'Global Broadcast' : 'Targeted Alert'}
                    </span>
                  </div>
                  <p className="text-gray-800 font-black text-sm leading-relaxed">{alert.message}</p>
                  
                  <div className="flex flex-wrap items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 text-accent-1" />
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-accent-1" />
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {alert.recipientEmail && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                        <User className="w-3.5 h-3.5 text-accent-1" />
                        Target: {alert.recipientEmail}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:border-l md:pl-6 border-gray-100">
                  <button 
                    onClick={() => startEdit(alert)}
                    className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Modify Broadcast"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteAlert(alert.id)}
                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Revoke Broadcast"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Synchronize Transmission</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Updating broadcast payload in real-time</p>
              </div>
              <button onClick={() => setEditingAlert(null)} className="p-3 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 rounded-2xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Alert Title</label>
                <input
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Payload Message</label>
                <textarea
                  value={editForm.message}
                  onChange={e => setEditForm({ ...editForm, message: e.target.value })}
                  required
                  rows={4}
                  className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black resize-none p-5"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Priority Protocol</label>
                <select
                  value={editForm.type}
                  onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  className="!bg-gray-50 !border-gray-200 !text-gray-900 font-black h-14"
                >
                  <option value="INFO">INFO PROTOCOL</option>
                  <option value="SUCCESS">SUCCESS PROTOCOL</option>
                  <option value="WARNING">WARNING PROTOCOL</option>
                  <option value="CRITICAL">CRITICAL PROTOCOL</option>
                </select>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setEditingAlert(null)} className="flex-1 px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Abort Changes</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-accent-1 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent-1/20 hover:-translate-y-1 transition-all">Update Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
