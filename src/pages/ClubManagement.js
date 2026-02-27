import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import clubService from '../services/clubService';
import './Dashboard.css';
import './DashboardMembers.css';

const CATEGORIES = ['Science','Literature','Debate','Cultural','Sports','IT','Photography',
  'Environment','Social Service','Arts','Music','Drama','Other'];
const STATUSES   = ['active','inactive','suspended'];

const emptyForm = {
  name:'',description:'',category:'',advisor:'',president:'',
  vicePresident:'',meetingDay:'',meetingTime:'',meetingVenue:'',
  establishedDate:'',budget:'',activities:'',achievements:'',
  status:'active',order:0
};

const statusConfig = {
  active:    {bg:'#d1fae5',color:'#065f46',dot:'active',  label:'✅ সক্রিয়',   topCls:'green'},
  inactive:  {bg:'#fee2e2',color:'#991b1b',dot:'inactive',label:'',topCls:'red'},
  suspended: {bg:'#fef3c7',color:'#92400e',dot:'leave',   label:'⚠️ স্থগিত',   topCls:'orange'},
};

const ClubManagement = () => {
  const [clubs,setClubs]             = useState([]);
  const [loading,setLoading]         = useState(true);
  const [saving,setSaving]           = useState(false);
  const [showForm,setShowForm]       = useState(false);
  const [editingClub,setEditingClub] = useState(null);
  const [searchTerm,setSearchTerm]   = useState('');
  const [filterCat,setFilterCat]     = useState('');
  const [filterStatus,setFilterStatus]= useState('');
  const [imageFile,setImageFile]     = useState(null);
  const [imagePreview,setImagePreview]= useState(null);
  const [formData,setFormData]       = useState(emptyForm);

  useEffect(()=>{ fetchClubs(); },[]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await clubService.getAllClubs();
      setClubs(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load clubs'); }
    finally { setLoading(false); }
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
    if (!formData.name){ toast.error('Club name required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v])=>fd.append(k,v));
      if (imageFile) fd.append('image',imageFile);
      if (editingClub){
        await clubService.updateClub(editingClub._id,fd);
        toast.success('Club updated!');
      } else {
        await clubService.createClub(fd);
        toast.success('Club created!');
      }
      resetForm(); fetchClubs();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = c => {
    setEditingClub(c);
    setFormData({
      name:c.name||'',description:c.description||'',category:c.category||'',
      advisor:c.advisor||'',president:c.president||'',vicePresident:c.vicePresident||'',
      meetingDay:c.meetingDay||'',meetingTime:c.meetingTime||'',
      meetingVenue:c.meetingVenue||'',
      establishedDate:c.establishedDate?c.establishedDate.split('T')[0]:'',
      budget:c.budget||'',activities:c.activities||'',achievements:c.achievements||'',
      status:c.status||'active',order:c.order||0,
    });
    setImagePreview(c.image?.url||null);
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const handleDelete = async id => {
    if (!window.confirm('এই ক্লাব মুছে ফেলবেন?')) return;
    try { await clubService.deleteClub(id); toast.success('Deleted!'); fetchClubs(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async id => {
    try { await clubService.toggleClubStatus(id); toast.success('Status updated!'); fetchClubs(); }
    catch { toast.error('Failed'); }
  };

  const resetForm = () => {
    setFormData(emptyForm); setEditingClub(null);
    setImageFile(null); setImagePreview(null); setShowForm(false);
  };

  const filtered = clubs.filter(c => {
    const q = searchTerm.toLowerCase();
    return (!searchTerm||c.name?.toLowerCase().includes(q)||c.category?.toLowerCase().includes(q)||c.advisor?.toLowerCase().includes(q)) &&
      (!filterCat||c.category===filterCat) &&
      (!filterStatus||c.status===filterStatus);
  });

  const sc = s => statusConfig[s] || statusConfig.inactive;

  return (
    <div className="dm-page dashboard-page">

      {/* ── Header ── */}
      <div className="dm-header">
        <div className="dm-header-left">
          <br></br>
          <h2>🏆 Club Management</h2>
          <br></br>
        </div>
        <button className="dm-btn-add" onClick={()=>{ resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ বাতিল' : '+ নতুন ক্লাব'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="dm-stats">
        {[
          {label:'মোট',       count:clubs.length,                                 color:'#667eea'},
          {label:'সক্রিয়',  count:clubs.filter(c=>c.status==='active').length,   color:'#10b981'},
          {label:'নিষ্ক্রিয়',count:clubs.filter(c=>c.status==='inactive').length, color:'#ef4444'},
          {label:'স্থগিত',   count:clubs.filter(c=>c.status==='suspended').length,color:'#f59e0b'},
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
            {editingClub ? '✏️ Edit' : ''}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dm-form-grid">
              <div className="dm-form-group">
                <label>নাম *</label>
                <input name="name" value={formData.name} onChange={handleInput} placeholder="name" required />
              </div>
              <div className="dm-form-group">
                <label>ক্যাটাগরি</label>
                <select name="category" value={formData.category} onChange={handleInput}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>উপদেষ্টা (Advisor)</label>
                <input name="advisor" value={formData.advisor} onChange={handleInput} placeholder="Teacher advisor name" />
              </div>
              <div className="dm-form-group">
                <label>সভাপতি (President)</label>
                <input name="president" value={formData.president} onChange={handleInput} placeholder="Club president" />
              </div>
              <div className="dm-form-group">
                <label>সহ-সভাপতি</label>
                <input name="vicePresident" value={formData.vicePresident} onChange={handleInput} placeholder="Vice president" />
              </div>
              <div className="dm-form-group">
                <label>দিন</label>
                <select name="meetingDay" value={formData.meetingDay} onChange={handleInput}>
                  <option value="">Select day</option>
                  {['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map(d=>(
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="dm-form-group">
                <label>সময়</label>
                <input name="meetingTime" value={formData.meetingTime} onChange={handleInput} placeholder="e.g. 3:00 PM" />
              </div>
              <div className="dm-form-group">
                <label>স্থান</label>
                <input name="meetingVenue" value={formData.meetingVenue} onChange={handleInput} placeholder="Meeting venue" />
              </div>
              <div className="dm-form-group">
                <label>প্রতিষ্ঠার তারিখ</label>
                <input type="date" name="establishedDate" value={formData.establishedDate} onChange={handleInput} />
              </div>
              <div className="dm-form-group">
                <label>বাজেট (৳)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleInput} placeholder="0" />
              </div>
              <div className="dm-form-group">
                <label>স্ট্যাটাস</label>
                <select name="status" value={formData.status} onChange={handleInput}>
                  {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>ছবি</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="preview" className="dm-image-preview" />}
              </div>
              <div className="dm-form-group full-span">
                <label>বিবরণ</label>
                <textarea name="description" value={formData.description} onChange={handleInput} rows={3} placeholder="Club description..." />
              </div>
              <div className="dm-form-group full-span">
                <label>কার্যক্রম (Activities)</label>
                <textarea name="activities" value={formData.activities} onChange={handleInput} rows={2} placeholder="Club activities..." />
              </div>
              <div className="dm-form-group full-span">
                <label>অর্জনসমূহ (Achievements)</label>
                <textarea name="achievements" value={formData.achievements} onChange={handleInput} rows={2} placeholder="Club achievements..." />
              </div>
            </div>
            <div className="dm-form-actions">
              <button type="button" className="dm-btn-cancel" onClick={resetForm}>বাতিল</button>
              <button type="submit" className="dm-btn-submit" disabled={saving}>
                {saving ? 'সংরক্ষণ...' : editingClub ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="dm-toolbar">
        <div className="dm-search">
          <i className="fas fa-search dm-search-icon"></i>
          <input type="text" placeholder="ক্লাবের নাম, ক্যাটাগরি দিয়ে খুঁজুন..."
            value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        </div>
        <div className="dm-filter">
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">সব ক্যাটাগরি</option>
            {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="dm-filter">
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">সব স্ট্যাটাস</option>
            {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="dm-loading"><div className="spinner"/></div>
      ) : filtered.length===0 ? (
        <div className="dm-empty">
          <span className="dm-empty-icon">🏆</span>
          <p>কোনো ক্লাব পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="dm-cards-grid">
          {filtered.map(c=>{
            const cfg = sc(c.status);
            return (
              <div key={c._id} className="dm-member-card">
                <div className={`dm-status-dot ${cfg.dot}`}/>

                {/* Image as top banner */}
                <div className={`dm-member-card-top ${cfg.topCls}`}
                  style={c.image?.url?{background:'none',padding:0}:undefined}>
                  {c.image?.url && (
                    <img src={c.image.url} alt={c.name}
                      style={{width:'100%',height:'100%',objectFit:'cover'}}
                      onError={e=>e.target.style.display='none'} />
                  )}
                </div>

                <div className="dm-member-card-body" style={{textAlign:'left'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div className="dm-member-name">{c.name}</div>
                      {c.category && (
                        <span style={{display:'inline-block',background:'#e0e7ff',color:'#4338ca',
                          fontSize:11,padding:'2px 10px',borderRadius:12,fontWeight:600,marginTop:3}}>
                          {c.category}
                        </span>
                      )}
                    </div>
                    <span className="dm-member-badge" style={{background:cfg.bg,color:cfg.color,fontSize:11}}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="dm-member-info">
                    {c.advisor && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-user-tie"/>
                        <span>উপদেষ্টা: <strong>{c.advisor}</strong></span>
                      </div>
                    )}
                    {c.president && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-crown"/>
                        <span>সভাপতি: <strong>{c.president}</strong></span>
                      </div>
                    )}
                    {c.meetingDay && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-calendar"/>
                        <span>{c.meetingDay}{c.meetingTime && ` — ${c.meetingTime}`}</span>
                      </div>
                    )}
                    {c.meetingVenue && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-map-marker-alt"/>
                        <span>{c.meetingVenue}</span>
                      </div>
                    )}
                    {c.budget && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-coins"/>
                        <span>বাজেট: ৳{parseInt(c.budget).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {c.achievements && (
                    <div style={{background:'#fffbeb',borderRadius:8,padding:'8px 10px',
                      marginBottom:10,fontSize:12,color:'#92400e',borderLeft:'3px solid #f59e0b'}}>
                      🏅 {c.achievements}
                    </div>
                  )}

                  <div className="dm-member-actions">
                    <button className="dm-action-btn edit"   onClick={()=>handleEdit(c)}>
                      <i className="fas fa-edit"/> Edit
                    </button>
                    {/* <button className="dm-action-btn toggle" onClick={()=>handleToggle(c._id)}>
                      <i className="fas fa-toggle-on"/>
                    </button> */}
                    <button className="dm-action-btn delete" onClick={()=>handleDelete(c._id)}>
                      <i className="fas fa-trash"/>✘
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

export default ClubManagement;
