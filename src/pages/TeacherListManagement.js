import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import teacherListService from '../services/teacherListService';
import './Dashboard.css';
import './DashboardMembers.css';

const DEPARTMENTS  = ['Bangla','English','Mathematics','Science','Social Science',
  'Physics','Chemistry','Biology','Computer Science','Physical Education',
  'Arts','Music','Islamic Studies','General'];
const DESIGNATIONS = ['Principal','Vice Principal','Head Teacher','Senior Teacher',
  'Assistant Teacher','Junior Teacher','Physical Education Teacher',
  'Lab Assistant','Librarian',
  'Lecturer',
  'Assistant Professor',
  'Associate Professor',
  'Computer Operator',
  'Computer Assistant',
  'Acting Principal',
  '3rd Class Employees',
  '4th Class Employees',
  'Office Assistant',
  'Others'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const STATUSES     = ['active','on-leave','resigned','retired'];

const emptyForm = {
  name:'',designation:'',email:'',phone:'',qualification:'',
  experience:'',subjects:'',department:'',teacherId:'',
  joiningDate:'',bloodGroup:'',status:'active',order:0
};

const statusColors = {
  'active':   { bg:'#d1fae5', color:'#065f46', dot:'active'   },
  'on-leave': { bg:'#fef3c7', color:'#92400e', dot:'leave'    },
  'resigned': { bg:'#fee2e2', color:'#991b1b', dot:'inactive' },
  'retired':  { bg:'#f3f4f6', color:'#4b5563', dot:'inactive' },
};

const cardTopColor = {
  'active':'green', 'on-leave':'orange', 'resigned':'red', 'retired':''
};

const TeacherListManagement = () => {
  const [teachers,setTeachers]             = useState([]);
  const [loading,setLoading]               = useState(true);
  const [saving,setSaving]                 = useState(false);
  const [showForm,setShowForm]             = useState(false);
  const [editingTeacher,setEditingTeacher] = useState(null);
  const [searchTerm,setSearchTerm]         = useState('');
  const [filterDept,setFilterDept]         = useState('');
  const [filterStatus,setFilterStatus]     = useState('');
  const [imageFile,setImageFile]           = useState(null);
  const [imagePreview,setImagePreview]     = useState(null);
  const [formData,setFormData]             = useState(emptyForm);

  useEffect(()=>{ fetchTeachers(); },[]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teacherListService.getAllTeachers();
      setTeachers(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load teachers'); }
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
    if (!formData.name||!formData.designation){ toast.error('Name & designation required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v])=>fd.append(k,v));
      if (imageFile) fd.append('image',imageFile);
      if (editingTeacher){
        await teacherListService.updateTeacher(editingTeacher._id,fd);
        toast.success('Teacher updated!');
      } else {
        await teacherListService.createTeacher(fd);
        toast.success('Teacher added!');
      }
      resetForm(); fetchTeachers();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = t => {
    setEditingTeacher(t);
    setFormData({
      name:t.name||'',designation:t.designation||'',email:t.email||'',
      phone:t.phone||'',qualification:t.qualification||'',
      experience:t.experience||'',
      subjects:Array.isArray(t.subjects)?t.subjects.join(', '):(t.subjects||''),
      department:t.department||'',teacherId:t.teacherId||'',
      joiningDate:t.joiningDate?t.joiningDate.split('T')[0]:'',
      bloodGroup:t.bloodGroup||'',status:t.status||'active',order:t.order||0,
    });
    setImagePreview(t.image?.url||null);
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const handleDelete = async id => {
    if (!window.confirm('এই শিক্ষক মুছে ফেলবেন?')) return;
    try { await teacherListService.deleteTeacher(id); toast.success('Deleted!'); fetchTeachers(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async id => {
    try { await teacherListService.toggleTeacherStatus(id); toast.success('Status updated!'); fetchTeachers(); }
    catch { toast.error('Failed'); }
  };

  const resetForm = () => {
    setFormData(emptyForm); setEditingTeacher(null);
    setImageFile(null); setImagePreview(null); setShowForm(false);
  };

  const filtered = teachers.filter(t => {
    const q = searchTerm.toLowerCase();
    return (!searchTerm||t.name?.toLowerCase().includes(q)||
      t.designation?.toLowerCase().includes(q)||t.email?.toLowerCase().includes(q)||
      t.teacherId?.toLowerCase().includes(q)) &&
      (!filterDept||t.department===filterDept) &&
      (!filterStatus||t.status===filterStatus);
  });

  const stConfig = s => statusColors[s] || {bg:'#f3f4f6',color:'#4b5563',dot:'inactive'};

  return (
    <div className="dm-page dashboard-page">

      {/* ── Header ── */}
      <div className="dm-header">
        <div className="dm-header-left">
          <br></br>
          <h2>👨‍🏫 Teacher List Management</h2>
          <br></br>
        </div>
        <button className="dm-btn-add" onClick={()=>{ resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ বাতিল' : '+ নতুন শিক্ষক'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="dm-stats">
        {[
          {label:'মোট',      count:teachers.length,                                 color:'#667eea'},
          {label:'সক্রিয়', count:teachers.filter(t=>t.status==='active').length,   color:'#10b981'},
          {label:'ছুটিতে',  count:teachers.filter(t=>t.status==='on-leave').length, color:'#f59e0b'},
          {label:'পদত্যাগ', count:teachers.filter(t=>t.status==='resigned'||t.status==='retired').length, color:'#ef4444'},
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
            {editingTeacher ? '✏️ শিক্ষক সম্পাদনা' : '➕ নতুন শিক্ষক যোগ'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dm-form-grid">
              <div className="dm-form-group">
                <label>নাম *</label>
                <input name="name" value={formData.name} onChange={handleInput} placeholder="Teacher's full name" required />
              </div>
              <div className="dm-form-group">
                <label>পদবি *</label>
                <select name="designation" value={formData.designation} onChange={handleInput} required>
                  <option value="">Select designation</option>
                  {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>বিভাগ</label>
                <select name="department" value={formData.department} onChange={handleInput}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="dm-form-group">
                <label>শিক্ষক আইডি</label>
                <input name="teacherId" value={formData.teacherId} onChange={handleInput} placeholder="e.g. T-001" />
              </div>
              <div className="dm-form-group">
                <label>ইমেইল</label>
                <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="teacher@school.com" />
              </div>
              <div className="dm-form-group">
                <label>ফোন</label>
                <input name="phone" value={formData.phone} onChange={handleInput} placeholder="01XXXXXXXXX" />
              </div>
              <div className="dm-form-group">
                <label>যোগ্যতা</label>
                <input name="qualification" value={formData.qualification} onChange={handleInput} placeholder="e.g. MSc in Physics" />
              </div>
              <div className="dm-form-group">
                <label>অভিজ্ঞতা</label>
                <input name="experience" value={formData.experience} onChange={handleInput} placeholder="e.g. 10 years" />
              </div>
              <div className="dm-form-group">
                <label>যোগদানের তারিখ</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInput} />
              </div>
              <div className="dm-form-group">
                <label>রক্তের গ্রুপ</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInput}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
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
                {imagePreview && <img src={imagePreview} alt="preview" className="dm-image-preview circle" />}
              </div>
              <div className="dm-form-group full-span">
                <label>বিষয়সমূহ (কমা দিয়ে আলাদা করুন)</label>
                <input name="subjects" value={formData.subjects} onChange={handleInput} placeholder="e.g. Physics, Mathematics, Science" />
              </div>
            </div>
            <div className="dm-form-actions">
              <button type="button" className="dm-btn-cancel" onClick={resetForm}>বাতিল</button>
              <button type="submit" className="dm-btn-submit" disabled={saving}>
                {saving ? 'সংরক্ষণ...' : editingTeacher ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="dm-toolbar">
        <div className="dm-search">
          <i className="fas fa-search dm-search-icon"></i>
          <input type="text" placeholder="নাম, পদবি, ইমেইল দিয়ে খুঁজুন..."
            value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        </div>
        <div className="dm-filter">
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}>
            <option value="">সব বিভাগ</option>
            {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
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
          <span className="dm-empty-icon">👨‍🏫</span>
          <p>কোনো শিক্ষক পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="dm-cards-grid">
          {filtered.map(t=>{
            const sc = stConfig(t.status);
            return (
              <div key={t._id} className="dm-member-card">
                {/* Status dot */}
                <div className={`dm-status-dot ${sc.dot}`}/>

                {/* Top color bar */}
                <div className={`dm-member-card-top ${cardTopColor[t.status]||''}`}/>

                {/* Avatar */}
                <div className="dm-member-avatar-wrap">
                  {t.image?.url
                    ? <img src={t.image.url} alt={t.name} className="dm-member-avatar"
                        onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
                    : null
                  }
                  <div className="dm-member-avatar-placeholder"
                    style={{display:t.image?.url?'none':'flex'}}>
                    👨‍🏫
                  </div>
                </div>

                {/* Body */}
                <div className="dm-member-card-body">
                  <div className="dm-member-name">{t.name}</div>
                  <div className="dm-member-designation">{t.designation}</div>

                  <span className="dm-member-badge"
                    style={{background:sc.bg,color:sc.color}}>
                    {t.status==='active'?'✅ সক্রিয়':
                     t.status==='on-leave'?'⏸ ছুটিতে':
                     t.status==='resigned'?'🚪 পদত্যাগ':''}
                  </span>

                  <div className="dm-member-info">
                    {t.department && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-building"/>
                        <span>{t.department}</span>
                      </div>
                    )}
                    {t.phone && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-phone"/>
                        <span>{t.phone}</span>
                      </div>
                    )}
                    {t.email && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-envelope"/>
                        <span style={{wordBreak:'break-all'}}>{t.email}</span>
                      </div>
                    )}
                    {t.qualification && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-graduation-cap"/>
                        <span>{t.qualification}</span>
                      </div>
                    )}
                    {t.experience && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-briefcase"/>
                        <span>{t.experience} অভিজ্ঞতা</span>
                      </div>
                    )}
                    {t.subjects && (
                      <div className="dm-member-info-row">
                        <i className="fas fa-book"/>
                        <span>{Array.isArray(t.subjects)?t.subjects.join(', '):t.subjects}</span>
                      </div>
                    )}
                  </div>

                  <div className="dm-member-actions">
                    <button className="dm-action-btn edit"   onClick={()=>handleEdit(t)}>
                      <i className="fas fa-edit"/> Edit
                    </button>
                    {/* <button className="dm-action-btn toggle" onClick={()=>handleToggle(t._id)}>
                      <i className="fas fa-toggle-on"/>
                    </button> */}
                    <button className="dm-action-btn delete" onClick={()=>handleDelete(t._id)}>
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

export default TeacherListManagement;
