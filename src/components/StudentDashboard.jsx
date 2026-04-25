import { Calendar, Clock, AlertCircle, CheckCircle, ArrowRight, Zap, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard({ user, stats }) {
    const data = [
        { name: 'Mon', usage: 4 },
        { name: 'Tue', usage: 7 },
        { name: 'Wed', usage: 5 },
        { name: 'Thu', usage: 9 },
        { name: 'Fri', usage: 6 },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-accent-1 to-accent-2 p-10 rounded-[40px] shadow-2xl text-white">
                <div className="relative z-10">
                    <h2 className="text-5xl font-heading font-black uppercase tracking-tighter leading-tight">Welcome back,<br/>{user.fullName.split(' ')[0]}</h2>
                    <p className="mt-4 text-white/80 font-black uppercase tracking-[0.3em] text-xs">Ready for your next learning session?</p>
                    
                    <div className="flex flex-wrap gap-4 mt-10">
                        <div className="glass-card !bg-white/10 !border-white/20 !p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">My Bookings</p>
                                <p className="text-xl font-black">{stats?.bookings?.length || 0}</p>
                            </div>
                        </div>
                        <div className="glass-card !bg-white/10 !border-white/20 !p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Active Tickets</p>
                                <p className="text-xl font-black">{stats?.tickets?.filter(t => t.status !== 'CLOSED').length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Zap className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 text-white/5 animate-pulse" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Usage Analytics */}
                <div className="lg:col-span-2 glass-card !bg-white/5 !border-white/10 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Resource Utilization</h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Weekly usage trends</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-accent-1/10 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-accent-1 animate-ping" />
                            <span className="text-[8px] font-black text-accent-1 uppercase">Live Data</span>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} fontWeight="900" />
                                <YAxis stroke="#ffffff40" fontSize={10} fontWeight="900" />
                                <Tooltip 
                                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: '900' }}
                                />
                                <Area type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Clock className="w-5 h-5 text-accent-1" />
                        Next Up
                    </h3>
                    
                    {stats?.bookings?.slice(0, 3).map((booking, i) => (
                        <div key={i} className="glass-card group hover:!bg-white/10 transition-all border-l-4 border-l-accent-1">
                            <p className="text-[10px] font-black text-accent-1 uppercase tracking-widest">{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <h4 className="text-lg font-black mt-1 group-hover:text-accent-1 transition-colors uppercase">{booking.purpose}</h4>
                            <div className="flex items-center gap-2 mt-3 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <MapPin className="w-3 h-3" />
                                {booking.resourceId}
                            </div>
                        </div>
                    ))}

                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                        View Full Schedule
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: 'Book Lab', icon: Zap, color: 'bg-blue-500' },
                    { label: 'Report Fault', icon: AlertCircle, color: 'bg-red-500' },
                    { label: 'Resource Map', icon: MapPin, color: 'bg-green-500' },
                    { label: 'Live Support', icon: Users, color: 'bg-purple-500' }
                ].map((action, i) => (
                    <button key={i} className="glass-card !bg-white/5 hover:!bg-white/10 group flex flex-col items-center text-center p-8 transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${action.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
