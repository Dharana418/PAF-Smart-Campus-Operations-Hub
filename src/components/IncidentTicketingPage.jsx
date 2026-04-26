import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MessageSquare, Wrench, Clock, Shield, PlusCircle, Paperclip, Send, CheckCircle, Check, XOctagon } from 'lucide-react';
import { apiClient } from '../api/client';

export default function IncidentTicketingPage({ user }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [resources, setResources] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newTicket, setNewTicket] = useState({
        resourceId: '',
        location: '',
        category: 'Hardware',
        description: '',
        priority: 'MEDIUM',
        contactDetails: ''
    });
    const [editTicket, setEditTicket] = useState({
        resourceId: '',
        location: '',
        category: 'Hardware',
        description: '',
        priority: 'MEDIUM',
        contactDetails: ''
    });
    const [commentText, setCommentText] = useState('');
    const fileInputRef = useRef(null);
    const successTimerRef = useRef(null);
    const errorTimerRef = useRef(null);

    const isStaffOrAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF' || user?.role === 'ROLE_TECHNICIAN';
    const isTechnician = user?.role === 'ROLE_TECHNICIAN' || user?.role === 'ROLE_ADMIN';
    const canModifySelectedTicket = !!selectedTicket && (isStaffOrAdmin || selectedTicket.reporterEmail === user?.email);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        };
    }, []);

    const showSuccess = (message) => {
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        setSuccessMsg(message);
        successTimerRef.current = setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (message) => {
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        setErrorMsg(message);
        errorTimerRef.current = setTimeout(() => setErrorMsg(''), 3500);
    };

    const getAttachmentDisplayName = (attachmentPath) => {
        if (!attachmentPath) return 'Attachment';
        const raw = attachmentPath.split('/').pop() || attachmentPath;
        const parts = raw.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : raw;
    };

    useEffect(() => {
        let isActive = true;
        const objectUrls = [];

        const loadAttachmentPreviews = async () => {
            const list = selectedTicket?.imageAttachments || [];
            if (!list.length) {
                setAttachmentPreviews({});
                return;
            }

            const entries = await Promise.all(
                list.map(async (attachmentPath) => {
                    const name = getAttachmentDisplayName(attachmentPath);

                    if (attachmentPath?.startsWith('/api/')) {
                        try {
                            const normalizedPath = attachmentPath.replace(/^\/api/, '');
                            const response = await apiClient.get(normalizedPath, { responseType: 'blob' });
                            const blob = response.data;
                            const objectUrl = URL.createObjectURL(blob);
                            objectUrls.push(objectUrl);
                            return [attachmentPath, { name, url: objectUrl, type: blob.type || '' }];
                        } catch (error) {
                            return [attachmentPath, { name, url: null, type: '' }];
                        }
                    }

                    return [attachmentPath, { name, url: attachmentPath, type: '' }];
                })
            );

            if (isActive) {
                setAttachmentPreviews(Object.fromEntries(entries));
            }
        };

        loadAttachmentPreviews();

        return () => {
            isActive = false;
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [selectedTicket]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tResp, rResp] = await Promise.all([
                apiClient.get(isStaffOrAdmin ? '/tickets' : '/tickets/my'),
                apiClient.get('/facilities/resources')
            ]);
            setTickets(tResp.data);
            setResources(rResp.data);
        } catch (err) {
            console.error('Failed to load tickets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const valid = files.filter(f => f.size <= 10 * 1024 * 1024); // 10MB capacity per file
        if (valid.length !== files.length) {
            showError('Some files were skipped because they exceed the 10MB limit.');
        }
        setAttachments(prev => [...prev, ...valid].slice(0, 5)); // max 5 files total
        e.target.value = ''; // reset so same files can be re-added after removal
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const sanitizeContactDetails = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return '';
        if (/^\d*$/.test(trimmed)) return trimmed.slice(0, 10);
        return value;
    };

    const validateContactDetails = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return true;
        if (/^\d+$/.test(trimmed)) return /^\d{10}$/.test(trimmed);
        return trimmed.includes('@');
    };

    const getContactValidationMessage = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return '';
        if (/^\d+$/.test(trimmed) && !/^\d{10}$/.test(trimmed)) {
            return 'Mobile number must be exactly 10 digits.';
        }
        if (!/^\d+$/.test(trimmed) && !trimmed.includes('@')) {
            return 'Email must contain @.';
        }
        return '';
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        const contactError = getContactValidationMessage(newTicket.contactDetails);
        if (contactError) {
            showError(contactError);
            return;
        }
        try {
            const formData = new FormData();
            Object.entries(newTicket).forEach(([k, v]) => formData.append(k, v));
            attachments.forEach(file => formData.append('attachments', file));

            await apiClient.post('/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowNewModal(false);
            setAttachments([]);
            setNewTicket({
                resourceId: '',
                location: '',
                category: 'Hardware',
                description: '',
                priority: 'MEDIUM',
                contactDetails: ''
            });
            loadData();
            showSuccess('Incident ticket created successfully.');
        } catch (err) {
            showError('Failed to create ticket.');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await apiClient.post(`/tickets/${selectedTicket.id}/comments`, { content: commentText });
            setCommentText('');
            const updated = await apiClient.get(isStaffOrAdmin ? '/tickets' : '/tickets/my');
            setTickets(updated.data);
            setSelectedTicket(updated.data.find(t => t.id === selectedTicket.id));
        } catch (err) {
            showError('Failed to add comment.');
        }
    };

    const updateTicketStatus = async (status) => {
        try {
            await apiClient.patch(`/tickets/${selectedTicket.id}/status`, { status });
            loadData();
            setShowNewModal(false);
            setSelectedTicket(null);
            showSuccess('Ticket status updated.');
        } catch (err) {
            showError('Failed to update status.');
        }
    };

    const openEditTicketModal = () => {
        if (!selectedTicket) return;
        setEditTicket({
            resourceId: selectedTicket.resourceId || '',
            location: selectedTicket.location || '',
            category: selectedTicket.category || 'Hardware',
            description: selectedTicket.description || '',
            priority: selectedTicket.priority || 'MEDIUM',
            contactDetails: selectedTicket.contactDetails || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        if (!selectedTicket) return;
        const contactError = getContactValidationMessage(editTicket.contactDetails);
        if (contactError) {
            showError(contactError);
            return;
        }
        try {
            await apiClient.patch(`/tickets/${selectedTicket.id}`, editTicket);
            setShowEditModal(false);
            await loadData();
            const refreshed = await apiClient.get(isStaffOrAdmin ? '/tickets' : '/tickets/my');
            const updatedTicket = refreshed.data.find(t => t.id === selectedTicket.id);
            setTickets(refreshed.data);
            setSelectedTicket(updatedTicket || null);
            showSuccess('Ticket updated successfully.');
        } catch (err) {
            showError('Failed to update ticket.');
        }
    };

    const handleDeleteTicket = async () => {
        if (!selectedTicket) return;
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTicket = async () => {
        if (!selectedTicket) return;
        try {
            await apiClient.delete(`/tickets/${selectedTicket.id}`);
            setSelectedTicket(null);
            setShowDeleteConfirm(false);
            await loadData();
            showSuccess('Ticket deleted successfully.');
        } catch (err) {
            showError('Failed to delete ticket.');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-500 bg-red-100';
            case 'HIGH': return 'text-orange-500 bg-orange-100';
            case 'MEDIUM': return 'text-blue-500 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    const isImageFile = (name, mimeType) => {
        if (mimeType?.startsWith('image/')) return true;
        return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name || '');
    };

    const isPdfFile = (name, mimeType) => {
        if (mimeType === 'application/pdf') return true;
        return /\.pdf$/i.test(name || '');
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
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-gray-900 mb-1">
                                {resources.find(r => r.id === ticket.resourceId)?.name || 'Facility Alert'}
                            </h4>
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
                                <div className="flex items-center gap-3">
                                    {canModifySelectedTicket && (
                                        <>
                                            <button
                                                onClick={openEditTicketModal}
                                                className="px-4 py-2 rounded-xl border border-gray-300 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDeleteTicket}
                                                className="px-4 py-2 rounded-xl border border-red-300 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
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
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-accent-1 uppercase tracking-widest mb-3">Incident Description</p>
                                    <p className="text-sm font-black text-gray-900 leading-relaxed">{selectedTicket.description}</p>
                                    {selectedTicket.imageAttachments?.length > 0 && (
                                        <div className="mt-6 space-y-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Attachments</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {selectedTicket.imageAttachments.map((attachmentPath, i) => {
                                                    const preview = attachmentPreviews[attachmentPath];
                                                    const name = preview?.name || getAttachmentDisplayName(attachmentPath);
                                                    const url = preview?.url;
                                                    const isImage = isImageFile(name, preview?.type);
                                                    const isPdf = isPdfFile(name, preview?.type);

                                                    return (
                                                        <div key={`${attachmentPath}-${i}`} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                                                            {url && isImage && (
                                                                <a href={url} target="_blank" rel="noreferrer" className="block">
                                                                    <img src={url} alt={name} className="w-full h-40 object-cover" />
                                                                </a>
                                                            )}

                                                            {url && isPdf && (
                                                                <div className="h-40 bg-gray-50">
                                                                    <iframe title={name} src={url} className="w-full h-full" />
                                                                </div>
                                                            )}

                                                            {(!url || (!isImage && !isPdf)) && (
                                                                <div className="h-40 bg-gray-50 border-b border-gray-200 flex items-center justify-center text-gray-400">
                                                                    <Paperclip className="w-8 h-8" />
                                                                </div>
                                                            )}

                                                            <div className="p-3 flex items-center justify-between gap-3">
                                                                <p className="text-[10px] font-black text-gray-700 truncate" title={name}>{name}</p>
                                                                {url && (
                                                                    <a href={url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase tracking-wider text-accent-1 hover:text-accent-2">
                                                                        Open
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center border-b border-gray-100 pb-4">
                                        Communication Thread
                                    </h4>
                                    {selectedTicket.comments?.map((comment, i) => (
                                        <div key={i} className={`flex ${comment.authorEmail === user.email ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm ${comment.authorEmail === user.email ? 'bg-accent-1 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{comment.authorEmail}</p>
                                                <p className="text-sm font-black leading-relaxed">{comment.content}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-40 text-right">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            {/* New Ticket Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setShowNewModal(false); setAttachments([]); }} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
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
                                            setNewTicket({ ...newTicket, resourceId: e.target.value, location: r?.location || '' });
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
                                        onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
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
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                />
                            </div>

                            {/* ── Attachments ── */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    Attachments{' '}
                                    <span className="normal-case font-semibold text-gray-400">(max 5 · 10MB each · JPG, PNG, PDF)</span>
                                </label>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {/* File pills */}
                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {attachments.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2"
                                            >
                                                <Paperclip className="w-3 h-3 text-blue-500 shrink-0" />
                                                <span className="text-[10px] font-black text-blue-700 max-w-[100px] truncate">{file.name}</span>
                                                <span className="text-[9px] text-blue-400">{formatFileSize(file.size)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(i)}
                                                    className="text-blue-400 hover:text-red-500 transition-colors font-black text-sm leading-none ml-1"
                                                    aria-label="Remove file"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Drop-zone trigger button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={attachments.length >= 5}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    {attachments.length >= 5 ? 'Maximum files reached' : 'Click to attach files'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Details</label>
                                <input
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    placeholder="Phone number or alternate email..."
                                    value={newTicket.contactDetails}
                                    onChange={e => setNewTicket({ ...newTicket, contactDetails: sanitizeContactDetails(e.target.value) })}
                                    inputMode={/^\d*$/.test(newTicket.contactDetails.trim()) ? 'numeric' : 'email'}
                                />
                                {newTicket.contactDetails.trim() && !validateContactDetails(newTicket.contactDetails) && (
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">
                                        {getContactValidationMessage(newTicket.contactDetails)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowNewModal(false); setAttachments([]); }}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-700"
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowEditModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tighter">Edit Incident</h3>
                        </div>

                        <form onSubmit={handleUpdateTicket} className="space-y-6 text-left">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Affected Facility</label>
                                    <select
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        required
                                        value={editTicket.resourceId}
                                        onChange={e => {
                                            const r = resources.find(res => res.id === e.target.value);
                                            setEditTicket({ ...editTicket, resourceId: e.target.value, location: r?.location || '' });
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
                                        value={editTicket.priority}
                                        onChange={e => setEditTicket({ ...editTicket, priority: e.target.value })}
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
                                    required
                                    value={editTicket.description}
                                    onChange={e => setEditTicket({ ...editTicket, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Details</label>
                                <input
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    value={editTicket.contactDetails}
                                    onChange={e => setEditTicket({ ...editTicket, contactDetails: sanitizeContactDetails(e.target.value) })}
                                    inputMode={/^\d*$/.test(editTicket.contactDetails.trim()) ? 'numeric' : 'email'}
                                />
                                {editTicket.contactDetails.trim() && !validateContactDetails(editTicket.contactDetails) && (
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">
                                        {getContactValidationMessage(editTicket.contactDetails)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 relative z-10 shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Delete Ticket?</h3>
                        <p className="mt-3 text-xs font-black text-gray-500 uppercase tracking-wider leading-relaxed">
                            Are you sure you want to permanently remove this ticket? This action cannot be undone.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-300 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteTicket}
                                className="flex-1 py-3 rounded-xl border border-red-300 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-10 right-10 z-[120] space-y-4">
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
        </div>
    );
}
