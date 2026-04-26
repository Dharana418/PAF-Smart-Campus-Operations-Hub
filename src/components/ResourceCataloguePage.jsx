import { useState, useEffect } from 'react';
import { Search, PlusCircle, MapPin, Users, Activity, Settings, Trash2, Edit2 } from 'lucide-react';
import { apiClient } from '../api/client';

export default function ResourceCataloguePage({ user }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [newResource, setNewResource] = useState({
        name: '',
        type: 'Lecture Hall',
        capacity: 50,
        location: '',
        status: 'ACTIVE'
    });
    const [editResource, setEditResource] = useState({
        name: '',
        type: 'Lecture Hall',
        capacity: 50,
        location: '',
        status: 'ACTIVE'
    });

    const isAdmin = user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            const resp = await apiClient.get('/facilities/resources');
            setResources(resp.data);
        } catch (err) {
            console.error('Failed to load resources', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/facilities/resources', newResource);
            setShowAddModal(false);
            loadResources();
            setNewResource({ name: '', type: 'Lecture Hall', capacity: 50, location: '', status: 'ACTIVE' });
        } catch (err) {
            alert('Failed to add resource');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await apiClient.delete(`/facilities/resources/${id}`);
            loadResources();
        } catch (err) {
            alert('Failed to delete resource');
        }
    };

    const startEdit = (resource) => {
        setEditingResource(resource);
        setEditResource({
            name: resource.name || '',
            type: resource.type || 'Lecture Hall',
            capacity: resource.capacity || 50,
            location: resource.location || '',
            status: resource.status || 'ACTIVE'
        });
    };

    const handleUpdateResource = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/facilities/resources/${editingResource.id}`, editResource);
            setEditingResource(null);
            loadResources();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update resource');
        }
    };

    const filteredResources = resources.filter(r => 
        (r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase())) &&
        (filterType === '' || r.type === filterType)
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Facilities Catalogue</h2>
                    <p className="text-accent-1 text-[10px] font-black uppercase tracking-[0.3em]">Module A – Resource Inventory</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest shadow-2xl"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add New Resource
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search resources by name or location..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="premium-input pl-16 w-full"
                    />
                </div>
                <select 
                    className="premium-input w-full"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="Lecture Hall">Lecture Halls</option>
                    <option value="Lab">Laboratories</option>
                    <option value="Meeting Room">Meeting Rooms</option>
                    <option value="Equipment">Equipment</option>
                </select>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center px-6 text-xs font-black uppercase tracking-widest text-gray-400">
                    Total: {filteredResources.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500 font-black uppercase tracking-widest">Loading catalogue...</div>
                ) : filteredResources.map(resource => (
                    <div key={resource.id} className="bg-white/95 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-2xl group hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${resource.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                <Activity className="w-7 h-7" />
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${resource.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {resource.status}
                            </span>
                        </div>
                        <h3 className="text-2xl font-heading font-black text-gray-900 mb-4">{resource.name}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <MapPin className="w-4 h-4 text-accent-1" />
                                <span className="text-xs font-black uppercase tracking-wider">{resource.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Users className="w-4 h-4 text-accent-1" />
                                <span className="text-xs font-black uppercase tracking-wider">Capacity: {resource.capacity}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Settings className="w-4 h-4 text-accent-1" />
                                <span className="text-xs font-black uppercase tracking-wider">{resource.type}</span>
                            </div>
                        </div>
                        
                        {isAdmin && (
                            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => startEdit(resource)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(resource.id)}
                                    className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-scale-in">
                        <h3 className="text-3xl font-heading font-black text-gray-900 mb-8 uppercase tracking-tighter">Add Resource</h3>
                        <form onSubmit={handleAddResource} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Name</label>
                                <input 
                                    className="premium-input !bg-gray-50 !text-gray-900" 
                                    required
                                    value={newResource.name}
                                    onChange={e => setNewResource({...newResource, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
                                    <select 
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        value={newResource.type}
                                        onChange={e => setNewResource({...newResource, type: e.target.value})}
                                    >
                                        <option>Lecture Hall</option>
                                        <option>Lab</option>
                                        <option>Meeting Room</option>
                                        <option>Equipment</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Capacity</label>
                                    <input 
                                        type="number"
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        required
                                        value={newResource.capacity}
                                        onChange={e => setNewResource({...newResource, capacity: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                                <input 
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    required
                                    value={newResource.location}
                                    onChange={e => setNewResource({...newResource, location: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                                <button type="submit" className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest">Register Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingResource && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingResource(null)} />
                    <div className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl animate-scale-in">
                        <h3 className="text-3xl font-heading font-black text-gray-900 mb-8 uppercase tracking-tighter">Edit Resource</h3>
                        <form onSubmit={handleUpdateResource} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Name</label>
                                <input 
                                    className="premium-input !bg-gray-50 !text-gray-900" 
                                    required
                                    value={editResource.name}
                                    onChange={e => setEditResource({ ...editResource, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
                                    <select 
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        value={editResource.type}
                                        onChange={e => setEditResource({ ...editResource, type: e.target.value })}
                                    >
                                        <option>Lecture Hall</option>
                                        <option>Lab</option>
                                        <option>Meeting Room</option>
                                        <option>Equipment</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Capacity</label>
                                    <input 
                                        type="number"
                                        className="premium-input !bg-gray-50 !text-gray-900"
                                        required
                                        value={editResource.capacity}
                                        onChange={e => setEditResource({ ...editResource, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                                <input 
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    required
                                    value={editResource.location}
                                    onChange={e => setEditResource({ ...editResource, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    className="premium-input !bg-gray-50 !text-gray-900"
                                    value={editResource.status}
                                    onChange={e => setEditResource({ ...editResource, status: e.target.value })}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingResource(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                                <button type="submit" className="flex-[2] btn btn-primary py-4 text-xs font-black uppercase tracking-widest">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
