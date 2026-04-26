import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Send, BarChart3, Activity, Layers, Timer, Eye, Download, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient } from '../api/client';

export default function BookingManagementPage({ user }) {
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrBooking, setQrBooking] = useState(null);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        resourceId: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: 1
    });
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmCancelBookingId, setConfirmCancelBookingId] = useState(null);
    const [confirmDeleteBookingId, setConfirmDeleteBookingId] = useState(null);

    const isAdmin = user?.role === 'ROLE_ADMIN';
    const nowLocalMin = useMemo(() => {
        const d = new Date();
        d.setSeconds(0, 0);
        const timezoneOffsetMs = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
    }, []);

    const showSuccess = (message) => {
        setSuccessMsg(message);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (message) => {
        setErrorMsg(message);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    const validateBookingForm = (form) => {
        if (!form.resourceId) return 'Please select a facility.';
        if (!form.startTime || !form.endTime) return 'Start and end time are required.';

        const start = new Date(form.startTime);
        const end = new Date(form.endTime);
        const now = new Date();

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return 'Please select valid start and end times.';
        }
        if (start < now) return 'Start time must be in the future.';
        if (start >= end) return 'End time must be after start time.';

        const durationHours = (end.getTime() - start.getTime()) / 3600000;
        if (durationHours > 12) return 'Booking duration cannot exceed 12 hours.';

        const trimmedPurpose = (form.purpose || '').trim();
        if (!trimmedPurpose) return 'Purpose of booking is required.';
        if (trimmedPurpose.length > 300) return 'Purpose cannot exceed 300 characters.';

        const attendees = Number(form.expectedAttendees);
        if (!Number.isInteger(attendees) || attendees < 1 || attendees > 1000) {
            return 'Expected attendees must be between 1 and 1000.';
        }

        return '';
    };
    const qrValue = useMemo(() => {
        if (!qrBooking) return '';
        const resourceName = resources.find((resource) => resource.id === qrBooking.resourceId)?.name || `Resource ${qrBooking.resourceId}`;
        const start = new Date(qrBooking.startTime);
        const end = new Date(qrBooking.endTime);
        const bookingDate = Number.isNaN(start.getTime()) ? 'N/A' : start.toLocaleDateString();
        const timeWindow = Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
            ? 'N/A'
            : `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        return [
            'SMART CAMPUS BOOKING PASS',
            `Booking ID: ${qrBooking.id}`,
            `Resource: ${resourceName}`,
            `Date: ${bookingDate}`,
            `Time: ${timeWindow}`,
            `Status: ${qrBooking.status || 'PENDING'}`
        ].join('\n');
    }, [qrBooking, resources]);

    const safeDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const durationHours = (start, end) => {
        const s = safeDate(start);
        const e = safeDate(end);
        if (!s || !e) return 0;
        return Math.max(0, (e.getTime() - s.getTime()) / 36e5);
    };

    const normalizedBookings = useMemo(() => {
        return bookings
            .map((booking) => {
                const start = safeDate(booking.startTime);
                const end = safeDate(booking.endTime);
                return {
                    ...booking,
                    start,
                    end,
                    duration: durationHours(booking.startTime, booking.endTime)
                };
            })
            .filter((booking) => booking.start && booking.end)
            .sort((a, b) => b.start.getTime() - a.start.getTime());
    }, [bookings]);

    const selectedBooking = useMemo(() => {
        if (!selectedBookingId) return null;
        return normalizedBookings.find((booking) => booking.id === selectedBookingId) || null;
    }, [selectedBookingId, normalizedBookings]);

    const analytics = useMemo(() => {
        const statusCounts = { APPROVED: 0, PENDING: 0, REJECTED: 0, CANCELLED: 0, OTHER: 0 };
        const resourceCountMap = new Map();
        const hourLoad = Array.from({ length: 24 }, () => 0);

        let totalDuration = 0;
        let totalExpectedAttendees = 0;
        let attendeeRecords = 0;

        normalizedBookings.forEach((booking) => {
            const status = String(booking.status || '').toUpperCase().trim();
            if (statusCounts[status] !== undefined) statusCounts[status] += 1;
            else statusCounts.OTHER += 1;

            totalDuration += booking.duration;

            if (typeof booking.expectedAttendees === 'number' && Number.isFinite(booking.expectedAttendees)) {
                totalExpectedAttendees += booking.expectedAttendees;
                attendeeRecords += 1;
            }

            const current = resourceCountMap.get(booking.resourceId) || 0;
            resourceCountMap.set(booking.resourceId, current + 1);

            const startHour = booking.start.getHours();
            const endHour = Math.max(startHour + 1, Math.ceil(booking.end.getHours() + booking.end.getMinutes() / 60));
            for (let hour = startHour; hour < Math.min(24, endHour); hour += 1) {
                hourLoad[hour] += 1;
            }
        });

        const byResource = Array.from(resourceCountMap.entries())
            .map(([resourceId, count]) => ({
                resourceId,
                name: resources.find((r) => r.id === resourceId)?.name || `Resource ${resourceId}`,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        const peakHour = hourLoad.reduce(
            (acc, value, hour) => (value > acc.value ? { hour, value } : acc),
            { hour: 0, value: 0 }
        );

        const total = normalizedBookings.length;
        const approved = statusCounts.APPROVED;

        return {
            total,
            approvedRate: total ? Math.round((approved / total) * 100) : 0,
            avgDuration: total ? (totalDuration / total).toFixed(1) : '0.0',
            avgAttendees: attendeeRecords ? (totalExpectedAttendees / attendeeRecords).toFixed(0) : '0',
            statusCounts,
            byResource,
            hourLoad,
            peakHour
        };
    }, [normalizedBookings, resources]);

    const bookingDetail = useMemo(() => {
        if (!selectedBooking) return null;

        const sameResource = normalizedBookings.filter(
            (entry) => entry.resourceId === selectedBooking.resourceId && entry.id !== selectedBooking.id
        );

        const overlaps = sameResource.filter((entry) => {
            return selectedBooking.start < entry.end && selectedBooking.end > entry.start;
        });

        const resourceLabel = resources.find((r) => r.id === selectedBooking.resourceId)?.name || `Resource ${selectedBooking.resourceId}`;

        return {
            resourceLabel,
            overlaps,
            overlapCount: overlaps.length,
            utilizationHint: overlaps.length >= 2 ? 'High overlap pressure' : overlaps.length === 1 ? 'Moderate overlap pressure' : 'No overlap pressure'
        };
    }, [selectedBooking, normalizedBookings, resources]);

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
        const validationError = validateBookingForm(bookingForm);
        if (validationError) {
            showError(validationError);
            return;
        }

        try {
            const response = await apiClient.post('/bookings', bookingForm);
            setQrBooking(response.data);
            setShowQrModal(true);
            setShowBookModal(false);
            setBookingForm({
                resourceId: '',
                startTime: '',
                endTime: '',
                purpose: '',
                expectedAttendees: 1
            });
            loadData();
            showSuccess('Booking request submitted successfully!');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to submit booking');
        }
    };

    const downloadQr = () => {
        const svg = document.getElementById('booking-qr-code');
        if (!svg || !qrBooking?.id) return;

        const serializer = new XMLSerializer();
        const svgBlob = new Blob([serializer.serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `booking-${qrBooking.id}.svg`;
        link.click();

        URL.revokeObjectURL(url);
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
            showSuccess(`Booking ${status.toLowerCase()} successfully.`);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const cancelBooking = async () => {
        if (!confirmCancelBookingId) return;
        try {
            await apiClient.post(`/bookings/${confirmCancelBookingId}/cancel`);
            setConfirmCancelBookingId(null);
            loadData();
            showSuccess('Booking cancelled successfully.');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const openQrForBooking = (booking) => {
        setSelectedBookingId(booking.id);
        setQrBooking(booking);
        setShowQrModal(true);
    };

    const canDeleteBooking = (booking) => {
        if (isAdmin) return true;
        return booking.status === 'CANCELLED' || booking.status === 'REJECTED';
    };

    const deleteBooking = async () => {
        if (!confirmDeleteBookingId) return;
        try {
            await apiClient.delete(`/bookings/${confirmDeleteBookingId}`);
            if (selectedBookingId === confirmDeleteBookingId) {
                setSelectedBookingId(null);
            }
            if (qrBooking?.id === confirmDeleteBookingId) {
                setShowQrModal(false);
                setQrBooking(null);
            }
            setConfirmDeleteBookingId(null);
            loadData();
            showSuccess('Booking deleted successfully.');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to delete booking');
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

            {isAdmin && !loading && normalizedBookings.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-3 bg-white/95 backdrop-blur-2xl rounded-[32px] p-7 shadow-2xl border border-white">
                        <div className="flex items-center justify-between gap-3 mb-6">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-accent-1" />
                                Booking Visual Analysis
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live from current records</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 border border-blue-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Total</p>
                                <p className="text-3xl font-black text-blue-900 mt-2">{analytics.total}</p>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">Approved Rate</p>
                                <p className="text-3xl font-black text-green-900 mt-2">{analytics.approvedRate}%</p>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 border border-orange-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700">Avg Duration</p>
                                <p className="text-3xl font-black text-orange-900 mt-2">{analytics.avgDuration}h</p>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 border border-purple-100">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-700">Avg Attendees</p>
                                <p className="text-3xl font-black text-purple-900 mt-2">{analytics.avgAttendees}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-accent-2" />
                                    Status Mix
                                </p>
                                {Object.entries(analytics.statusCounts).map(([status, count]) => {
                                    if (count === 0) return null;
                                    const width = analytics.total ? Math.max(8, Math.round((count / analytics.total) * 100)) : 0;
                                    return (
                                        <div key={status} className="mb-3">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1">
                                                <span>{status}</span>
                                                <span>{count}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-gray-700 to-gray-900" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-accent-2" />
                                    Resource Load
                                </p>
                                {analytics.byResource.map((resource) => {
                                    const width = analytics.total ? Math.max(10, Math.round((resource.count / analytics.total) * 100)) : 0;
                                    return (
                                        <div key={resource.resourceId} className="mb-3">
                                            <div className="flex justify-between gap-3 text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1">
                                                <span className="truncate">{resource.name}</span>
                                                <span>{resource.count}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${width}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-accent-2" />
                                    Hourly Booking Pressure
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Peak: {analytics.peakHour.hour}:00</p>
                            </div>
                            <div className="grid grid-cols-12 md:grid-cols-24 gap-1.5">
                                {analytics.hourLoad.map((count, hour) => {
                                    const intensity = Math.min(1, count / Math.max(1, analytics.peakHour.value));
                                    return (
                                        <div
                                            key={hour}
                                            title={`${hour}:00 - ${count} bookings`}
                                            className="h-8 rounded-md border border-gray-100"
                                            style={{ backgroundColor: `rgba(37, 99, 235, ${0.1 + intensity * 0.75})` }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-2 bg-white/95 backdrop-blur-2xl rounded-[32px] p-7 shadow-2xl border border-white">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-accent-1" />
                            Booking Detail Lens
                        </h3>

                        {bookingDetail && selectedBooking ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Selected Resource</p>
                                    <p className="text-xl font-black text-gray-900 mt-1">{bookingDetail.resourceLabel}</p>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mt-2">{selectedBooking.start.toLocaleString()} - {selectedBooking.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl p-4 border border-gray-100 bg-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Duration</p>
                                        <p className="text-2xl font-black text-gray-900 mt-1">{selectedBooking.duration.toFixed(1)}h</p>
                                    </div>
                                    <div className="rounded-2xl p-4 border border-gray-100 bg-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Overlaps</p>
                                        <p className="text-2xl font-black text-gray-900 mt-1">{bookingDetail.overlapCount}</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl p-4 border border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Utilization Hint</p>
                                    <p className="text-sm font-black text-gray-900 mt-2">{bookingDetail.utilizationHint}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Intersecting Bookings</p>
                                    {bookingDetail.overlaps.length === 0 ? (
                                        <p className="text-xs font-black text-green-700 uppercase tracking-wider">No overlapping slots detected</p>
                                    ) : (
                                        <div className="space-y-2 max-h-52 overflow-auto pr-1">
                                            {bookingDetail.overlaps.map((entry) => (
                                                <div key={entry.id} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-red-700">{entry.status} • {entry.userEmail}</p>
                                                    <p className="text-[11px] font-black text-red-900 mt-1">{entry.start.toLocaleString()} - {entry.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">
                                <p className="text-xs font-black uppercase tracking-widest">Pick any booking card below to inspect details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                        <div
                            key={booking.id}
                            onClick={isAdmin ? () => setSelectedBookingId(booking.id) : undefined}
                            className={`bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] border shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 group transition-all ${isAdmin ? 'cursor-pointer' : ''} ${isAdmin && selectedBookingId === booking.id ? 'border-blue-400 ring-4 ring-blue-100' : 'border-white'} ${isAdmin ? 'hover:border-blue-200' : ''}`}
                        >
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
                                    <button
                                        type="button"
                                        onClick={() => openQrForBooking(booking)}
                                        className="px-6 py-3 rounded-2xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        View QR
                                    </button>
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
                                            onClick={() => setConfirmCancelBookingId(booking.id)}
                                            className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                    {canDeleteBooking(booking) && (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteBookingId(booking.id)}
                                            className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Delete Booking"
                                        >
                                            <Trash2 className="w-5 h-5" />
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
                                        min={nowLocalMin}
                                        value={bookingForm.startTime}
                                        onChange={e => setBookingForm((prev) => {
                                            const nextStart = e.target.value;
                                            return {
                                                ...prev,
                                                startTime: nextStart,
                                                endTime: prev.endTime && prev.endTime <= nextStart ? '' : prev.endTime
                                            };
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">End Time</label>
                                    <input 
                                        type="datetime-local"
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        required
                                        min={bookingForm.startTime || nowLocalMin}
                                        disabled={!bookingForm.startTime}
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
                                    min={1}
                                    max={1000}
                                    step={1}
                                    required
                                    value={bookingForm.expectedAttendees}
                                    onChange={e => {
                                        const parsed = Number.parseInt(e.target.value, 10);
                                        setBookingForm({ ...bookingForm, expectedAttendees: Number.isNaN(parsed) ? 1 : parsed });
                                    }}
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

            {showQrModal && qrBooking && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowQrModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-10 relative z-10 shadow-2xl animate-scale-in">
                        <h3 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tighter mb-2">Booking QR Pass</h3>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-8">Show this QR when checking in</p>

                        <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex justify-center mb-6">
                            <QRCodeSVG
                                id="booking-qr-code"
                                value={qrValue}
                                size={220}
                                level="M"
                                includeMargin
                                bgColor="#ffffff"
                                fgColor="#111827"
                            />
                        </div>

                        <div className="rounded-2xl border border-gray-100 p-4 bg-white mb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Booking ID</p>
                            <p className="text-sm font-black text-gray-900 break-all mt-1">{qrBooking.id}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-3">Resource</p>
                            <p className="text-sm font-black text-gray-900 mt-1">{resources.find((resource) => resource.id === qrBooking.resourceId)?.name || `Resource ${qrBooking.resourceId}`}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-3">Time</p>
                            <p className="text-sm font-black text-gray-900 mt-1">
                                {new Date(qrBooking.startTime).toLocaleString()} - {new Date(qrBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-3">Status</p>
                            <p className="text-sm font-black text-gray-900 mt-1">{qrBooking.status}</p>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowQrModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Close</button>
                            <button type="button" onClick={downloadQr} className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download QR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmCancelBookingId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={() => setConfirmCancelBookingId(null)} />
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 relative z-10 shadow-2xl animate-scale-in border border-white">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Confirm Cancellation</h3>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-8">Cancel this booking?</p>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setConfirmCancelBookingId(null)}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Keep Booking
                            </button>
                            <button
                                type="button"
                                onClick={cancelBooking}
                                className="flex-[2] py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDeleteBookingId && (
                <div className="fixed inset-0 z-[121] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={() => setConfirmDeleteBookingId(null)} />
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 relative z-10 shadow-2xl animate-scale-in border border-white">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Confirm Deletion</h3>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-8">Delete this booking permanently?</p>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteBookingId(null)}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Keep Booking
                            </button>
                            <button
                                type="button"
                                onClick={deleteBooking}
                                className="flex-[2] py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-10 right-10 z-[130] space-y-4">
                {successMsg && (
                    <div className="flex items-center gap-4 p-5 rounded-[24px] bg-white border-2 border-green-500 shadow-2xl animate-slide-up">
                        <div className="p-2 bg-green-500 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-gray-900 font-black text-xs uppercase tracking-widest">{successMsg}</p>
                    </div>
                )}
                {errorMsg && (
                    <div className="flex items-center gap-4 p-5 rounded-[24px] bg-white border-2 border-red-500 shadow-2xl animate-slide-up">
                        <div className="p-2 bg-red-500 rounded-xl">
                            <XCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-gray-900 font-black text-xs uppercase tracking-widest">{errorMsg}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
