import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, Tool, Clock, Shield, PlusCircle, Paperclip, Send, CheckCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export default function IncidentTicketingPage({ user }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [resources, setResources] = useState([]);
    const [newTicket, setNewTicket] = useState({
        resourceId: '',
        location: '',
        category: 'Hardware',
        description: '',
        priority: 'MEDIUM',
        contactDetails: ''
    });
    const [commentText, setCommentText] = useState('');

    const isStaffOrAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF' || user?.role === 'ROLE_TECHNICIAN';
    const isTechnician = user?.role === 'ROLE_TECHNICIAN' || user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tResp, rResp] = await Promise.all([
                apiClient.get(isStaffOrAdmin ? '/api/tickets' : '/api/tickets/my'),
                apiClient.get('/api/resources')
            ]);
            setTickets(tResp.data);
            setResources(rResp.data);
        } catch (err) {
            console.error('Failed to load tickets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/tickets', newTicket);
            setShowNewModal(false);
            loadData();
            alert('Incident ticket created successfully.');
        } catch (err) {
            alert('Failed to create ticket');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await apiClient.post(`/api/tickets/${selectedTicket.id}/comments`, { content: commentText });
            setCommentText('');
            const updated = await apiClient.get(isStaffOrAdmin ? '/api/tickets' : '/api/tickets/my');
            setTickets(updated.data);
            setSelectedTicket(updated.data.find(t => t.id === selectedTicket.id));
        } catch (err) {
            alert('Failed to add comment');
        }
    };

    const updateTicketStatus = async (status) => {
        try {
            await apiClient.patch(`/api/tickets/${selectedTicket.id}/status`, { status });
            loadData();
            setShowNewModal(false);
            setSelectedTicket(null);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'CRITICAL': return 'text-red-600 bg-red-100';
            case 'HIGH': return 'text-orange-600 bg-orange-100';
            case 'MEDIUM': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Maintenance & Incidents</h2>
                    <p className="text-accent-1 text-[10px] font-black uppercase tracking-[0.3em]">Module C – Ticketing System</p>
                </div>
                <button 
                    onClick={() => setShowNewModal(true)}
                    className="btn btn-primary flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest shadow-2xl"
                >
                    <AlertTriangle className="w-5 h-5" />
                    Report New Incident
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Tickets List */}
                <div className="xl:col-span-1 space-y-4">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500 font-black">Loading tickets...</div>
                    ) : tickets.map(ticket => (
                        <div 
                            key={ticket.id} 
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-6 rounded-3xl border transition-all cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-white border-accent-1 shadow-xl' : 'bg-white/95 border-white hover:bg-white shadow-md'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-lg font-black text-gray-900 mb-1">{resources.find(r => r.id === ticket.resourceId)?.name || 'Facility Alert'}</h4>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">{ticket.location}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${ticket.status === 'RESOLVED' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{ticket.status}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black">{ticket.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ticket Details / Conversation */}
                <div className="xl:col-span-2">
                    {selectedTicket ? (
                        <div className="bg-white/95 backdrop-blur-2xl rounded-[40px] border border-white shadow-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-gray-900">Ticket #{selectedTicket.id.slice(-6).toUpperCase()}</h3>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Category: {selectedTicket.category}</p>
                                </div>
                                {isTechnician && selectedTicket.status !== 'RESOLVED' && (
                                    <button 
                                        onClick={() => updateTicketStatus('RESOLVED')}
                                        className="btn btn-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark Resolved
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-accent-1 uppercase tracking-widest mb-3">Incident Description</p>
                                    <p className="text-sm font-black text-gray-900 leading-relaxed">{selectedTicket.description}</p>
                                    <div className="mt-6 flex gap-4">
                                        {selectedTicket.imageAttachments?.map((img, i) => (
                                            <div key={i} className="w-20 h-20 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400">
                                                <Paperclip className="w-6 h-6" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center border-b border-gray-100 pb-4">Communication Thread</h4>
                                    {selectedTicket.comments?.map((comment, i) => (
                                        <div key={i} className={`flex ${comment.authorEmail === user.email ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm ${comment.authorEmail === user.email ? 'bg-accent-1 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{comment.authorEmail}</p>
                                                <p className="text-sm font-black leading-relaxed">{comment.content}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-40 text-right">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50 border-t border-gray-100">
                                <form onSubmit={handleAddComment} className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Add a comment or update..." 
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        className="premium-input !bg-white !border-gray-200 !text-gray-900 pl-6 pr-16"
                                    />
                                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-1 hover:text-accent-2 transition-colors p-2">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-[40px] h-full flex flex-col items-center justify-center py-20 text-center">
                            <MessageSquare className="w-16 h-16 text-gray-600 mb-6" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Ticket Console</h3>
                            <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Select a ticket to view conversation and resolution steps</p>
                        </div>
                    )}
                </div>
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowNewModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tighter">Report Incident</h3>
                        </div>
                        <form onSubmit={handleCreateTicket} className="space-y-6 text-left">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Affected Facility</label>
                                    <select 
                                        className="premium-input !bg-gray-50 !text-gray-900" 
                                        required
                                        value={newTicket.resourceId}
                                        onChange={e => {
                                            const r = resources.find(res => res.id === e.target.value);
                                            setNewTicket({...newTicket, resourceId: e.target.value, location: r?.location || ''})
                                        }}
                                    >
                                        <option value="">Select Resource...</option>
                                        {resources.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Priority Level</label>
                                    <select 
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        value={newTicket.priority}
                                        onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                                    >
                                        <option>LOW</option>
                                        <option>MEDIUM</option>
                                        <option>HIGH</option>
                                        <option>CRITICAL</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description of Issue</label>
                                <textarea 
                                    rows={4}
                                    className="premium-input !bg-gray-50 !text-gray-900 resize-none"
                                    placeholder="Describe the problem in detail..."
                                    required
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Details</label>
                                <input 
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    placeholder="Phone number or alternate email..."
                                    value={newTicket.contactDetails}
                                    onChange={e => setNewTicket({...newTicket, contactDetails: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Discard</button>
                                <button type="submit" className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-700">Submit Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
