import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import '../pages/Dashboard.css';
import '../pages/DashboardMembers.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

const ROLES = ['সভাপতি','সদস্য সচিব','সদস্য'];

const roleConfig = {
  'সভাপতি':      { bg:'#dbeafe', color:'#1e40af', topCls:'blue',   emoji:'👑' },
  'সদস্য সচিব':  { bg:'#fef3c7', color:'#92400e', topCls:'orange', emoji:'📋' },
  'সদস্য':       { bg:'#f3f4f6', color:'#374151', topCls:'',       emoji:'👤' },
};

const emptyForm = {
  name:'', designation:'', role:'সদস্য',
  description:'', phone:'', email:'', order:0
};

const GoverningBodyManagement = () => {
  const [members,setMembers]           = useState([]);
  const [loading,setLoading]           = useState(true);
  const [saving,setSaving]             = useState(false);
  const [showForm,setShowForm]         = useState(false);
  const [editingMember,setEditingMember] = useState(null);
  const [searchTerm,setSearchTerm]     = useState('');
  const [filterRole,setFilterRole]     = useState('');
  const [imageFile,setImageFile]       = useState(null);
  const [imagePreview,setImagePreview] = useState(null);
  const [formData,setFormData]         = useState(emptyForm);

  useEffect(()=>{ fetchMembers(); },[]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/governing-body`,{
        headers:{Authorization:`Bearer ${token}`}
      });
      setMembers(res.data.data || []);
    } catch(err){
      console.error('Fetch error:',err);
      toast.error('Failed to fetch members');
    } finally { setLoading(false); }
  };

  const handleInput = e => {
    const {name,value} = e.target;
    setFormData(p=>({...p,[name]:value}));
  };

  const handleImageChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size>5*1024*1024){ toast.error('Max 5MB'); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v])=>fd.append(k,v));
      if (imageFile) fd.append('image',imageFile);

      const cfg = {
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'multipart/form-data'}
      };

      if (editingMember){
        await axios.put(`${API_URL}/governing-body/${editingMember._id}`,fd,cfg);
        toast.success('Member updated!');
      } else {
        await axios.post(`${API_URL}/governing-body`,fd,cfg);
        toast.success('Member added!');
      }
      resetForm(); fetchMembers();
    } catch(err){
      toast.error(err.response?.data?.message||'Failed to save');
    } finally { setSaving(false); }
  };

  const handleEdit = m => {
    setEditingMember(m);
    setFormData({
      name:m.name||'',designation:m.designation||'',
      role:m.role||'সদস্য',description:m.description||'',
      phone:m.phone||'',email:m.email||'',order:m.order||0,
    });
    setImagePreview(m.image?.url||null);
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const handleDelete = async id => {
    if (!window.confirm('এই সদস্য মুছে ফেলবেন?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/governing-body/${id}`,{
        headers:{Authorization:`Bearer ${token}`}
      });
      toast.success('Deleted!'); fetchMembers();
    } catch { toast.error('Failed to delete'); }
  };

  const resetForm = () => {
    setFormData(emptyForm); setEditingMember(null);
    setImageFile(null); setImagePreview(null); setShowForm(false);
  };

  const filtered = members.filter(m => {
    const q = searchTerm.toLowerCase();
    return (!searchTerm||m.name?.toLowerCase().includes(q)||
      m.designation?.toLowerCase().includes(q)) &&
      (!filterRole||m.role===filterRole);
  });

  const rc = r => roleConfig[r] || roleConfig['সদস্য'];

  return (
    <div className="dm-page dashboard-page">

      {/* ── Header ── */}
      <div className="dm-header">
        <div className="dm-header-left">
          <br></br>
          <h2>🏛️ Governing Body Management</h2>
          <br></br>
          
        </div>
        <button className="dm-btn-add" onClick={()=>{ resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ বাতিল' : '+ নতুন সদস্য'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="dm-stats">
        {[
          {label:'মোট সদস্য',  count:members.length,                                 color:'#667eea'},
          {label:'সভাপতি',     count:members.filter(m=>m.role==='সভাপতি').length,    color:'#3b82f6'},
          {label:'সদস্য সচিব', count:members.filter(m=>m.role==='সদস্য সচিব').length,color:'#f59e0b'},
          {label:'সাধারণ সদস্য',count:members.filter(m=>m.role==='সদস্য').length,    color:'#10b981'},
        ].map(s=>(
          <div key={s.label} className="dm-stat" style={{'--stat-color':s.color}}>
            <div className="dm-stat-value">{s.count}</div>
            <div className="dm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="dm-form-card">
          <div className="dm-form-title">
            {editingMember ? '✏️ সদস্য সম্পাদনা' : '➕ নতুন সদস্য যোগ'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dm-form-grid">
              <div className="dm-form-group">
                <label>নাম *</label>
                <input name="name" value={formData.name} onChange={handleInput}
                  placeholder="সদস্যের পূর্ণ নাম" required />
              </div>
              <div className="dm-form-group">
                <label>পদবি *</label>
                <input name="designation" value={formData.designation} onChange={handleInput}
                  placeholder="e.g. উপজেলা নির্বাহী অফিসার" required />
              </div>
              <div className="dm-form-group">
                <label>ভূমিকা *</label>
                <select name="role" value={formData.role} onChange={handleInput} required>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>ক্রম (Order)</label>
                <input type="number" name="order" value={formData.order} onChange={handleInput} min="0" />
              </div>
              <div className="dm-form-group">
                <label>ফোন</label>
                <input name="phone" value={formData.phone} onChange={handleInput} placeholder="01XXXXXXXXX" />
              </div>
              <div className="dm-form-group">
                <label>ইমেইল</label>
                <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="member@example.com" />
              </div>
              <div className="dm-form-group">
                <label>ছবি</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="preview" className="dm-image-preview circle" />}
              </div>
              <div className="dm-form-group full-span">
                <label>বিবরণ *</label>
                <textarea name="description" value={formData.description} onChange={handleInput}
                  rows={3} placeholder="সদস্যের ভূমিকা ও দায়িত্ব..." required />
              </div>
            </div>
            <div className="dm-form-actions">
              <button type="button" className="dm-btn-cancel" onClick={resetForm}>বাতিল</button>
              <button type="submit" className="dm-btn-submit" disabled={saving}>
                {saving ? 'সংরক্ষণ...' : editingMember ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="dm-toolbar">
        <div className="dm-search">
          <i className="fas fa-search dm-search-icon"></i>
          <input type="text" placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
            value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        </div>
        <div className="dm-filter">
          <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
            <option value="">সব ভূমিকা</option>
            {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="dm-loading"><div className="spinner"/></div>
      ) : filtered.length===0 ? (
        <div className="dm-empty">
          <span className="dm-empty-icon">🏛️</span>
          <p>কোনো সদস্য পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="dm-cards-grid">
          {filtered.map(m=>{
            const cfg = rc(m.role);
            return (
              <div key={m._id} className="dm-member-card">
                {/* Top color band */}
                <div className={`dm-member-card-top ${cfg.topCls}`}/>

                {/* Avatar */}
                <div className="dm-member-avatar-wrap">
                  {m.image?.url
                    ? <>
                        <img src={m.image.url} alt={m.name} className="dm-member-avatar"
                          onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
                        <div className="dm-member-avatar-placeholder" style={{display:'none'}}>{cfg.emoji}</div>
                      </>
                    : <div className="dm-member-avatar-placeholder">{cfg.emoji}</div>
                  }
                </div>

                {/* Body */}
                <div className="dm-member-card-body">
                  <div className="dm-member-name">{m.name}</div>
                  <div className="dm-member-designation">{m.designation}</div>

                  <span className="dm-member-badge" style={{background:cfg.bg,color:cfg.color}}>
                    {cfg.emoji} {m.role}
                  </span>

                  <div className="dm-member-info">
                    {m.phone && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-phone"/>
                        <span>{m.phone}</span>
                      </div>
                    )}
                    {m.email && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-envelope"/>
                        <span style={{wordBreak:'break-all'}}>{m.email}</span>
                      </div>
                    )}
                    {m.description && (
                      <div className="dm-member-info-row" style={{alignItems:'flex-start'}}>
                        <i className="fas fa-info-circle" style={{marginTop:3}}/>
                        <span style={{fontSize:12,lineHeight:1.5}}>
                          {m.description.substring(0,100)}{m.description.length>100&&'...'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="dm-member-actions">
                    <button className="dm-action-btn edit"   onClick={()=>handleEdit(m)}>
                      <i className="fas fa-edit"/> Edit
                    </button>
                    <button className="dm-action-btn delete" onClick={()=>handleDelete(m._id)}>
                      ✘ Delete 
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoverningBodyManagement;
