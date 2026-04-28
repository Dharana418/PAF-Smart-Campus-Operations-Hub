import { Activity, Shield, Users, AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StaffDashboard({ user, stats }) {
    const ticketData = [
        { name: 'Open', value: stats?.tickets?.filter(t => t.status === 'OPEN').length || 0, color: '#ef4444' },
        { name: 'In Progress', value: stats?.tickets?.filter(t => t.status === 'IN_PROGRESS').length || 0, color: '#f59e0b' },
        { name: 'Resolved', value: stats?.tickets?.filter(t => t.status === 'RESOLVED').length || 0, color: '#10b981' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Operational Command</h2>
                    <p className="text-accent-1 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Staff Portal • Real-time Monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Healthy</span>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Assets', value: '42', change: '+2', trend: 'up' },
                    { label: 'Active Bookings', value: stats?.bookings?.length || 0, change: '+12%', trend: 'up' },
                    { label: 'Avg Resolution', value: '2.4h', change: '-15%', trend: 'down' },
                    { label: 'User Satisfaction', value: '98%', change: '+1%', trend: 'up' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card !bg-white/5 p-6 border-b-2 border-b-white/5 hover:border-b-accent-1 transition-all">
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                        <div className="flex items-end justify-between mt-2">
                            <h4 className="text-3xl font-black">{stat.value}</h4>
                            <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Maintenance Queue */}
                <div className="glass-card !bg-white/5 !border-white/10 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Activity className="w-5 h-5 text-accent-1" />
                            Maintenance Queue
                        </h3>
                        <button className="text-[10px] font-black text-accent-1 uppercase tracking-widest hover:underline">View All Tickets</button>
                    </div>
                    
                    <div className="space-y-4">
                        {stats?.tickets?.slice(0, 4).map((ticket, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        ticket.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
                                        ticket.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                                    }`}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white group-hover:text-accent-1 transition-colors uppercase">{ticket.title}</h4>
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">{ticket.resourceId} • {ticket.status}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Distribution */}
                <div className="glass-card !bg-white/5 !border-white/10 p-8">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-accent-1" />
                        Status Distribution
                    </h3>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ticketData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} fontWeight="900" />
                                <YAxis stroke="#ffffff40" fontSize={10} fontWeight="900" />
                                <Tooltip 
                                    cursor={{fill: '#ffffff05'}}
                                    contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: '900' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {ticketData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Staff Actions */}
            <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 border border-white/10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Fast Protocol</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <button className="btn btn-primary !py-4 !px-4 text-[10px] font-black uppercase tracking-widest">New Maintenance Log</button>
                    <button className="btn bg-white/5 !text-white border border-white/10 !py-4 !px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:!text-black transition-all">Audit Bookings</button>
                    <button className="btn bg-white/5 !text-white border border-white/10 !py-4 !px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:!text-black transition-all">Inventory Check</button>
                    <button className="btn bg-white/5 !text-white border border-white/10 !py-4 !px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:!text-black transition-all">Broadcast Alert</button>
                </div>
            </div>
        </div>
    );
}
