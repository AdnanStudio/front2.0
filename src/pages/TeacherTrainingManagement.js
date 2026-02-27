import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import teacherTrainingService from '../services/teacherTrainingService';
import './Dashboard.css';
import './DashboardMembers.css';

const TRAINING_TYPES = [
  'Pedagogical Skills','Subject Knowledge','Technology Integration',
  'Classroom Management','Assessment & Evaluation','Student Psychology',
  'Leadership Development','Special Education','Soft Skills','Other'
];
const STATUSES = ['upcoming','ongoing','completed','cancelled'];

const emptyForm = {
  name:'',description:'',trainer:'',trainingType:'',
  startDate:'',endDate:'',duration:'',venue:'',
  totalSeats:'',status:'upcoming',budget:'',materials:'',phone:''
};

const statusTagCls = {
  upcoming:'status-upcoming', ongoing:'status-ongoing',
  completed:'status-completed', cancelled:'status-cancelled',
};

const TeacherTrainingManagement = () => {
  const [trainings,setTrainings]             = useState([]);
  const [loading,setLoading]                 = useState(true);
  const [saving,setSaving]                   = useState(false);
  const [showForm,setShowForm]               = useState(false);
  const [editingTraining,setEditingTraining] = useState(null);
  const [searchTerm,setSearchTerm]           = useState('');
  const [filterStatus,setFilterStatus]       = useState('');
  const [imageFile,setImageFile]             = useState(null);
  const [imagePreview,setImagePreview]       = useState(null);
  const [formData,setFormData]               = useState(emptyForm);

  useEffect(()=>{ fetchTrainings(); },[]);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await teacherTrainingService.getAllTrainings();
      setTrainings(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load trainings'); }
    finally { setLoading(false); }
  };

  const handleInput = e => {
    const {name,value} = e.target;
    setFormData(p=>({...p,[name]:value}));
  };

  const handleImageChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5*1024*1024){ toast.error('Max 5MB'); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name||!formData.trainer){ toast.error('Name & trainer required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v])=>fd.append(k,v));
      if (imageFile) fd.append('image',imageFile);
      if (editingTraining){
        await teacherTrainingService.updateTraining(editingTraining._id,fd);
        toast.success('Training updated!');
      } else {
        await teacherTrainingService.createTraining(fd);
        toast.success('Training created!');
      }
      resetForm(); fetchTrainings();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = t => {
    setEditingTraining(t);
    setFormData({
      name:t.name||'',description:t.description||'',trainer:t.trainer||'',
      trainingType:t.trainingType||'',
      startDate:t.startDate?t.startDate.split('T')[0]:'',
      endDate:t.endDate?t.endDate.split('T')[0]:'',
      duration:t.duration||'',venue:t.venue||'',
      totalSeats:t.totalSeats||'',status:t.status||'upcoming',
      budget:t.budget||'',materials:t.materials||'',phone:t.phone||'',
    });
    setImagePreview(t.image?.url||null);
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const handleDelete = async id => {
    if (!window.confirm('এই ট্রেনিং মুছে ফেলবেন?')) return;
    try { await teacherTrainingService.deleteTraining(id); toast.success('Deleted!'); fetchTrainings(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async id => {
    try { await teacherTrainingService.toggleTrainingStatus(id); toast.success('Status updated!'); fetchTrainings(); }
    catch { toast.error('Failed'); }
  };

  const resetForm = () => {
    setFormData(emptyForm); setEditingTraining(null);
    setImageFile(null); setImagePreview(null); setShowForm(false);
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('bn-BD') : '—';

  const filtered = trainings.filter(t => {
    const q = searchTerm.toLowerCase();
    return (!searchTerm || t.name?.toLowerCase().includes(q)||
      t.trainer?.toLowerCase().includes(q)||t.trainingType?.toLowerCase().includes(q)) &&
      (!filterStatus || t.status===filterStatus);
  });

  return (
    <div className="dm-page dashboard-page">

      {/* ── Header ── */}
      <div className="dm-header">
        <div className="dm-header-left">
          <br></br>
          <h2>🎓 Teacher Training Management</h2>
          <br></br>
          
        </div>
        <button className="dm-btn-add" onClick={()=>{ resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ বাতিল' : '+ নতুন ট্রেনিং'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="dm-stats">
        {[
          {label:'মোট',    count:trainings.length,                                    color:'#667eea'},
          {label:'আসন্ন', count:trainings.filter(t=>t.status==='upcoming').length,   color:'#3b82f6'},
          {label:'চলমান', count:trainings.filter(t=>t.status==='ongoing').length,    color:'#f59e0b'},
          {label:'সম্পন্ন',count:trainings.filter(t=>t.status==='completed').length, color:'#10b981'},
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
            {editingTraining ? '✏️ Edit' : ''}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dm-form-grid">
              <div className="dm-form-group">
                <label>নাম *</label>
                <input name="name" value={formData.name} onChange={handleInput} placeholder="e.g. Digital Teaching Methods" required />
              </div>
              <div className="dm-form-group">
                <label>প্রশিক্ষক *</label>
                <input name="trainer" value={formData.trainer} onChange={handleInput} placeholder="Trainer name" required />
              </div>
              <div className="dm-form-group">
                <label>ট্রেনিং ধরন</label>
                <select name="trainingType" value={formData.trainingType} onChange={handleInput}>
                  <option value="">Select type</option>
                  {TRAINING_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>স্ট্যাটাস</label>
                <select name="status" value={formData.status} onChange={handleInput}>
                  {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>শুরুর তারিখ</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInput} />
              </div>
              <div className="dm-form-group">
                <label>শেষের তারিখ</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInput} />
              </div>
              <div className="dm-form-group">
                <label>সময়কাল</label>
                <input name="duration" value={formData.duration} onChange={handleInput} placeholder="e.g. 3 days" />
              </div>
              <div className="dm-form-group">
                <label>স্থান (Venue)</label>
                <input name="venue" value={formData.venue} onChange={handleInput} placeholder="Training venue" />
              </div>
              <div className="dm-form-group">
                <label>মোট আসন</label>
                <input type="number" name="totalSeats" value={formData.totalSeats} onChange={handleInput} placeholder="0" />
              </div>
              <div className="dm-form-group">
                <label>বাজেট (৳)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleInput} placeholder="0" />
              </div>
              <div className="dm-form-group">
                <label>ফোন</label>
                <input name="phone" value={formData.phone} onChange={handleInput} placeholder="Contact number" />
              </div>
              <div className="dm-form-group">
                <label>ছবি</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="preview" className="dm-image-preview" />}
              </div>
              <div className="dm-form-group full-span">
                <label>বিবরণ</label>
                <textarea name="description" value={formData.description} onChange={handleInput} rows={3} placeholder="Training objectives..." />
              </div>
              <div className="dm-form-group full-span">
                <label>প্রয়োজনীয় উপকরণ</label>
                <textarea name="materials" value={formData.materials} onChange={handleInput} rows={2} placeholder="e.g. Laptop, Projector..." />
              </div>
            </div>
            <div className="dm-form-actions">
              <button type="button" className="dm-btn-cancel" onClick={resetForm}>বাতিল</button>
              <button type="submit" className="dm-btn-submit" disabled={saving}>
                {saving ? 'সংরক্ষণ...' : editingTraining ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="dm-toolbar">
        <div className="dm-search">
          <i className="fas fa-search dm-search-icon"></i>
          <input type="text" placeholder="নাম, প্রশিক্ষক বা ধরন দিয়ে খুঁজুন..."
            value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        </div>
        <div className="dm-filter">
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">সব স্ট্যাটাস</option>
            {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="dm-loading"><div className="spinner"/></div>
      ) : filtered.length===0 ? (
        <div className="dm-empty">
          <span className="dm-empty-icon">🎓</span>
          <p>কোনো ট্রেনিং পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>ট্রেনিং</th>
                <th>প্রশিক্ষক</th>
                <th>ধরন</th>
                <th>তারিখ</th>
                <th>সময়কাল</th>
                <th>স্থান</th>
                <th>আসন</th>
                <th>স্ট্যাটাস</th>
                <th>বাজেট</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t._id}>
                  <td>
                    <div className="dm-table-training-cell">
                      {t.image?.url
                        ? <img src={t.image.url} alt={t.name} className="dm-table-training-thumb"
                            onError={e=>e.target.style.display='none'} />
                        : <div className="dm-table-training-placeholder">🎓</div>
                      }
                      <div>
                        <div className="dm-table-training-name">{t.name}</div>
                        {t.description && (
                          <div className="dm-table-training-desc">
                            {t.description.substring(0,60)}{t.description.length>60&&'...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><strong>{t.trainer||'—'}</strong></td>
                  <td>{t.trainingType ? <span className="dm-tag type">{t.trainingType}</span> : '—'}</td>
                  <td>
                    {t.startDate&&<div>{fmtDate(t.startDate)}</div>}
                    {t.endDate&&<div style={{fontSize:12,color:'#9ca3af'}}>→ {fmtDate(t.endDate)}</div>}
                    {!t.startDate&&!t.endDate&&'—'}
                  </td>
                  <td>{t.duration||'—'}</td>
                  <td>{t.venue||'—'}</td>
                  <td><strong>{t.totalSeats||'—'}</strong></td>
                  <td>
                    <span className={`dm-tag ${statusTagCls[t.status]||''}`}>
                      {t.status?t.status.charAt(0).toUpperCase()+t.status.slice(1):'—'}
                    </span>
                  </td>
                  <td>{t.budget?`৳${parseInt(t.budget).toLocaleString()}`:'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="dm-action-btn edit"   onClick={()=>handleEdit(t)}><i className="fas fa-edit"/>Edit</button>
                      {/* <button className="dm-action-btn toggle" onClick={()=>handleToggle(t._id)}><i className="fas fa-toggle-on"/></button> */}
                      <button className="dm-action-btn delete" onClick={()=>handleDelete(t._id)}><i className="fas fa-trash"/>✘</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherTrainingManagement;
