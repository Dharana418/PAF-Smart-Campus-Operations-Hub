import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({ type: '', minCapacity: '', location: '' });
  const [formData, setFormData] = useState({
    name: '', type: '', capacity: '', location: '',
    availableFrom: '08:00', availableUntil: '20:00', status: 'ACTIVE'
  });

  const API_URL = 'http://localhost:8081/api/resources';

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
      if (filters.location) params.append('location', filters.location);
      const res = await axios.get(`${API_URL}?${params}`);
      setResources(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingResource) {
        await axios.put(`${API_URL}/${editingResource.id}`, formData);
        setSuccess('Resource updated!');
      } else {
        await axios.post(API_URL, formData);
        setSuccess('Resource created!');
      }
      fetchResources();
      setShowForm(false);
      setEditingResource(null);
      setFormData({ name: '', type: '', capacity: '', location: '', availableFrom: '08:00', availableUntil: '20:00', status: 'ACTIVE' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      await axios.delete(`${API_URL}/${id}`);
      setSuccess('Resource deleted!');
      fetchResources();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData(resource);
    setShowForm(true);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Capacity', 'Location', 'Status'];
    const rows = resources.map(r => [r.id, r.name, r.type, r.capacity, r.location, r.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facilities_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess('Exported to CSV!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const resourceTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'PROJECTOR', 'CAMERA'];
  const statusOptions = ['ACTIVE', 'OUT_OF_SERVICE'];

  const total = resources.length;
  const active = resources.filter(r => r.status === 'ACTIVE').length;
  const inactive = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;

  const getIcon = (type) => {
    const icons = { LECTURE_HALL: '🏛️', LAB: '🔬', MEETING_ROOM: '💼', PROJECTOR: '📽️', CAMERA: '📷' };
    return icons[type] || '📦';
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🏫 Facilities & Assets Catalogue</h1>
        <p>Member 1 - Resource Management | SLIIT Malabe Campus</p>
        <div className="header-actions">
          <button onClick={exportCSV} className="btn-export">📊 Export CSV</button>
          <button onClick={() => { setEditingResource(null); setFormData({ name: '', type: '', capacity: '', location: '', availableFrom: '08:00', availableUntil: '20:00', status: 'ACTIVE' }); setShowForm(true); }} className="btn-add">+ Add Resource</button>
        </div>
      </header>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="stats">
        <div className="stat"><span className="stat-value">{total}</span><span className="stat-label">Total</span></div>
        <div className="stat"><span className="stat-value">{active}</span><span className="stat-label">Active</span></div>
        <div className="stat"><span className="stat-value">{inactive}</span><span className="stat-label">Inactive</span></div>
      </div>

      <div className="filters">
        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option>
          {resourceTypes.map(t => <option key={t}>{t}</option>)}
        </select>
        <input type="number" placeholder="Min Capacity" value={filters.minCapacity} onChange={e => setFilters({...filters, minCapacity: e.target.value})} />
        <input type="text" placeholder="Location" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} />
        <button onClick={() => setFilters({ type: '', minCapacity: '', location: '' })}>Clear</button>
        <div className="view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>Grid</button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className={`resources ${viewMode}`}>
        {resources.map(res => (
          <div key={res.id} className="card">
            <div className="card-header">
              <span className="icon">{getIcon(res.type)}</span>
              <div><h3>{res.name}</h3><span className="type">{res.type}</span></div>
              <span className={`status ${res.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{res.status}</span>
            </div>
            <div className="card-body">
              <p>👥 Capacity: {res.capacity} people</p>
              <p>📍 Location: {res.location}</p>
              <p>⏰ Available: {res.availableFrom || '08:00'} - {res.availableUntil || '20:00'}</p>
            </div>
            <div className="card-footer">
              <button onClick={() => handleEdit(res)}>✏️ Edit</button>
              <button onClick={() => handleDelete(res.id, res.name)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
        {resources.length === 0 && !loading && <div className="empty">No resources found. Click "Add Resource" to start.</div>}
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                <option value="">Select Type</option>
                {resourceTypes.map(t => <option key={t}>{t}</option>)}
              </select>
              <input type="number" placeholder="Capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
              <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              <div className="time-row">
                <input type="time" value={formData.availableFrom} onChange={e => setFormData({...formData, availableFrom: e.target.value})} />
                <span>to</span>
                <input type="time" value={formData.availableUntil} onChange={e => setFormData({...formData, availableUntil: e.target.value})} />
              </div>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                {statusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;