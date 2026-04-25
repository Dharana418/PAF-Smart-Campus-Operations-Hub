import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Trash2, Send } from 'lucide-react';
import { apiClient } from '../api/client';

export default function BookingManagementPage({ user }) {
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        resourceId: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: 1
    });

    const isAdmin = user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bResp, rResp] = await Promise.all([
                apiClient.get(isAdmin ? '/bookings' : '/bookings/my'),
                apiClient.get('/facilities/resources')
            ]);
            setBookings(bResp.data);
            setResources(rResp.data.filter(r => r.status === 'ACTIVE'));
        } catch (err) {
            console.error('Failed to load booking data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/bookings', bookingForm);
            setShowBookModal(false);
            loadData();
            alert('Booking request submitted successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit booking');
        }
    };

    const updateStatus = async (id, status) => {
        let reason = '';
        if (status === 'REJECTED') {
            reason = prompt('Enter rejection reason:');
            if (reason === null) return;
        }
        try {
            await apiClient.patch(`/bookings/${id}/status`, { status, reason });
            loadData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            await apiClient.post(`/bookings/${id}/cancel`);
            loadData();
        } catch (err) {
            alert('Failed to cancel booking');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'APPROVED': return 'bg-green-500';
            case 'REJECTED': return 'bg-red-500';
            case 'PENDING': return 'bg-yellow-500';
            case 'CANCELLED': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Booking Management</h2>
                    <p className="text-accent-1 text-[10px] font-black uppercase tracking-[0.3em]">{isAdmin ? 'Module B – All Requests' : 'Module B – My Bookings'}</p>
                </div>
                {!isAdmin && (
                    <button 
                        onClick={() => setShowBookModal(true)}
                        className="btn btn-primary flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest shadow-2xl"
                    >
                        <Calendar className="w-5 h-5" />
                        Request New Booking
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center text-gray-500 font-black uppercase tracking-widest">Processing records...</div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-[40px] py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No bookings found</p>
                    </div>
                ) : (
                    bookings.map(booking => (
                        <div key={booking.id} className="bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg ${getStatusColor(booking.status)}`}>
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{resources.find(r => r.id === booking.resourceId)?.name || 'Resource ' + booking.resourceId}</h3>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5 text-accent-1" />
                                            {new Date(booking.startTime).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 text-accent-1" />
                                            {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        {isAdmin && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-accent-2 uppercase tracking-widest">
                                                <Users className="w-3.5 h-3.5" />
                                                {booking.userName || booking.userEmail}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm font-black text-gray-900 mt-4 leading-relaxed max-w-xl">“{booking.purpose}”</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-4">
                                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-md ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                                
                                <div className="flex items-center gap-3 mt-2">
                                    {isAdmin && booking.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => updateStatus(booking.id, 'APPROVED')}
                                                className="p-3 rounded-2xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(booking.id, 'REJECTED')}
                                                className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Reject"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                    {!isAdmin && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                        <button 
                                            onClick={() => cancelBooking(booking.id)}
                                            className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                                {booking.rejectionReason && (
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-wider text-right">Reason: {booking.rejectionReason}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showBookModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowBookModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-scale-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-accent-1 text-white flex items-center justify-center">
                                <Send className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tighter">Request Booking</h3>
                        </div>
                        <form onSubmit={handleBooking} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Facility</label>
                                <select 
                                    className="premium-input !bg-gray-50 !text-gray-900" 
                                    required
                                    value={bookingForm.resourceId}
                                    onChange={e => setBookingForm({...bookingForm, resourceId: e.target.value})}
                                >
                                    <option value="">Choose a resource...</option>
                                    {resources.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Start Time</label>
                                    <input 
                                        type="datetime-local"
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        required
                                        value={bookingForm.startTime}
                                        onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">End Time</label>
                                    <input 
                                        type="datetime-local"
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        required
                                        value={bookingForm.endTime}
                                        onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Purpose of Booking</label>
                                <textarea 
                                    rows={3}
                                    className="premium-input !bg-gray-50 !text-gray-900 resize-none"
                                    placeholder="Briefly describe the event/meeting..."
                                    required
                                    value={bookingForm.purpose}
                                    onChange={e => setBookingForm({...bookingForm, purpose: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expected Attendees</label>
                                <input 
                                    type="number"
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    value={bookingForm.expectedAttendees}
                                    onChange={e => setBookingForm({...bookingForm, expectedAttendees: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Discard</button>
                                <button type="submit" className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
