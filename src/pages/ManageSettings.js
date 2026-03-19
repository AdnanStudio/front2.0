// src/pages/ManageSettings.js
// Tabs: Scrolling Text | Hero Images | About Image | Chairman (Principal) | President (সভাপতি)
// Chairman Image  → endpoint: /api/settings/chairman-image  → shows in "অধ্যক্ষের বাণী"
// President Image → endpoint: /api/settings/notice-image    → shows in "সভাপতির বাণী"
import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Upload, Trash2, Plus, Edit2, Save, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import settingsService from '../services/settingsService';
import './ManageSettings.css';

const TABS = [
  { id: 'scrolling', label: '📝 Scrolling Text' },
  { id: 'hero',      label: '🖼️ Hero Images' },
  { id: 'about',     label: '📸 About Image' },
  { id: 'chairman',  label: '👤 Principal Image (অধ্যক্ষের ছবি)' },
  { id: 'president', label: '👑 President Image (সভাপতির ছবি)' },
];

function UploadBox({ id, preview, file, onChange, onUpload, onCancel, uploading, placeholder, hint }) {
  return (
    <div className="upload-section">
      <div className="upload-box">
        <input type="file" id={id} accept="image/*" onChange={onChange} style={{ display: 'none' }} />
        <label htmlFor={id} className="upload-label">
          {preview
            ? <img src={preview} alt="Preview" className="image-preview" />
            : (
              <div className="upload-placeholder">
                <Upload size={48} />
                <p>{placeholder}</p>
                {hint && <span>{hint}</span>}
              </div>
            )
          }
        </label>
      </div>
      {file && (
        <div className="upload-actions">
          <button onClick={onUpload} disabled={uploading} className="btn-primary">
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      )}
    </div>
  );
}

function CurrentImg({ url, alt, onDelete }) {
  if (!url) return null;
  return (
    <div className="current-image-display">
      <h3>Current Image</h3>
      <div className="image-preview-large">
        <img src={url} alt={alt} />
        <button onClick={onDelete} className="btn-delete-overlay">
          <Trash2 size={20} /> Delete Image
        </button>
      </div>
    </div>
  );
}

const ManageSettings = () => {
  const [loading,   setLoading]   = useState(true);
  const [settings,  setSettings]  = useState(null);
  const [activeTab, setActiveTab] = useState('scrolling');

  // Scrolling text
  const [newScrollText,    setNewScrollText]    = useState('');
  const [editingTextId,    setEditingTextId]    = useState(null);
  const [editingTextValue, setEditingTextValue] = useState('');

  // Hero images
  const [heroFile,    setHeroFile]    = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [heroUploading, setHeroUploading] = useState(false);

  // About image
  const [aboutFile,    setAboutFile]    = useState(null);
  const [aboutPreview, setAboutPreview] = useState(null);
  const [aboutUploading, setAboutUploading] = useState(false);

  // Chairman (Principal) image → "অধ্যক্ষের বাণী"
  const [chairFile,    setChairFile]    = useState(null);
  const [chairPreview, setChairPreview] = useState(null);
  const [chairUploading, setChairUploading] = useState(false);

  // President image → "সভাপতির বাণী" (uses noticeImage endpoint)
  const [presFile,    setPresFile]    = useState(null);
  const [presPreview, setPresPreview] = useState(null);
  const [presUploading, setPresUploading] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      setSettings(res.data);
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  // ── Scrolling text ─────────────────────────────────────────────────────
  const addText = async () => {
    if (!newScrollText.trim()) { toast.error('Text required'); return; }
    try { await settingsService.addScrollingText({ text: newScrollText }); toast.success('Added'); setNewScrollText(''); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  const updateText = async (id) => {
    if (!editingTextValue.trim()) { toast.error('Text required'); return; }
    try { await settingsService.updateScrollingText(id, { text: editingTextValue }); toast.success('Updated'); setEditingTextId(null); setEditingTextValue(''); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  const deleteText = async (id) => {
    if (!window.confirm('Delete this text?')) return;
    try { await settingsService.deleteScrollingText(id); toast.success('Deleted'); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  const toggleText = async (id, current) => {
    try { await settingsService.updateScrollingText(id, { isActive: !current }); toast.success(current ? 'Deactivated' : 'Activated'); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  // ── Hero images ─────────────────────────────────────────────────────────
  const uploadHero = async () => {
    if (!heroFile) { toast.error('Select image'); return; }
    if ((settings?.heroImages?.length || 0) >= 10) { toast.error('Max 10 hero images'); return; }
    try {
      setHeroUploading(true);
      const fd = new FormData(); fd.append('image', heroFile);
      await settingsService.addHeroImage(fd);
      toast.success('Hero image added'); setHeroFile(null); setHeroPreview(null); fetchSettings();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setHeroUploading(false); }
  };

  const deleteHero = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await settingsService.deleteHeroImage(id); toast.success('Deleted'); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  // ── About ───────────────────────────────────────────────────────────────
  const uploadAbout = async () => {
    if (!aboutFile) { toast.error('Select image'); return; }
    try {
      setAboutUploading(true);
      const fd = new FormData(); fd.append('image', aboutFile);
      await settingsService.updateAboutImage(fd);
      toast.success('About image updated'); setAboutFile(null); setAboutPreview(null); fetchSettings();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setAboutUploading(false); }
  };

  // ── Chairman (Principal) ────────────────────────────────────────────────
  const uploadChairman = async () => {
    if (!chairFile) { toast.error('Select image'); return; }
    try {
      setChairUploading(true);
      const fd = new FormData(); fd.append('image', chairFile);
      await settingsService.updateChairmanImage(fd);
      toast.success('Principal image updated'); setChairFile(null); setChairPreview(null); fetchSettings();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setChairUploading(false); }
  };

  const deleteChairman = async () => {
    if (!window.confirm('Delete principal image?')) return;
    try { await settingsService.deleteChairmanImage(); toast.success('Deleted'); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  // ── President (সভাপতি) — noticeImage endpoint ──────────────────────────
  const uploadPresident = async () => {
    if (!presFile) { toast.error('Select image'); return; }
    try {
      setPresUploading(true);
      const fd = new FormData(); fd.append('image', presFile);
      await settingsService.updateNoticeImage(fd);   // reuses noticeImage endpoint
      toast.success('President image updated'); setPresFile(null); setPresPreview(null); fetchSettings();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setPresUploading(false); }
  };

  const deletePresident = async () => {
    if (!window.confirm('Delete president image?')) return;
    try { await settingsService.deleteNoticeImage(); toast.success('Deleted'); fetchSettings(); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };

  if (loading) {
    return (
      <div className="manage-settings-page" style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: 16, color: '#666' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="manage-settings-page">
      <div className="page-header">
        <div className="header-left">
          <Settings size={32} />
          <div>
            <h1>Manage Website Settings</h1>
            <p>Control scrolling text, hero images, principal & president images</p>
          </div>
        </div>
      </div>

      <div className="settings-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="settings-content">

        {/* ── SCROLLING TEXT ── */}
        {activeTab === 'scrolling' && (
          <div className="settings-section">
            <h2>Manage Scrolling Text</h2>
            <p className="section-description">Announcements shown in the header ticker. Seamless looping.</p>
            <div className="add-text-form">
              <input type="text" placeholder="Enter scrolling text..."
                value={newScrollText} onChange={e => setNewScrollText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addText()}
              />
              <button onClick={addText} className="btn-primary"><Plus size={18} /> Add</button>
            </div>
            <div className="scrolling-texts-list">
              {!settings?.scrollingTexts?.length ? (
                <div className="empty-state"><AlertCircle size={40} /><p>No texts yet</p></div>
              ) : settings.scrollingTexts.map(item => (
                <div key={item._id} className="scrolling-text-item">
                  {editingTextId === item._id ? (
                    <div className="edit-mode">
                      <input type="text" autoFocus value={editingTextValue} onChange={e => setEditingTextValue(e.target.value)} />
                      <button onClick={() => updateText(item._id)} className="btn-save"><Save size={16} /></button>
                      <button onClick={() => { setEditingTextId(null); setEditingTextValue(''); }} className="btn-cancel"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="text-content">
                        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <p>{item.text}</p>
                      </div>
                      <div className="text-actions">
                        <button onClick={() => toggleText(item._id, item.isActive)} className="btn-toggle" title="Toggle">
                          {item.isActive ? '🟢' : '🔴'}
                        </button>
                        <button onClick={() => { setEditingTextId(item._id); setEditingTextValue(item.text); }} className="btn-edit"><Edit2 size={16} /></button>
                        <button onClick={() => deleteText(item._id)} className="btn-delete"><Trash2 size={16} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HERO IMAGES ── */}
        {activeTab === 'hero' && (
          <div className="settings-section">
            <h2>Manage Hero Images</h2>
            <p className="section-description">
              Home page carousel images. Max 10. These also appear in the Photo Gallery section.
            </p>
            <UploadBox id="hero-img" preview={heroPreview} file={heroFile}
              onChange={e => { const f=e.target.files[0]; if(f){setHeroFile(f);setHeroPreview(URL.createObjectURL(f));} }}
              onUpload={uploadHero} onCancel={() => { setHeroFile(null); setHeroPreview(null); }}
              uploading={heroUploading} placeholder="Click to upload hero image" hint="Recommended: 1920×600px" />
            <div className="hero-images-grid">
              <div className="grid-header">
                <h3>Current Hero Images ({settings?.heroImages?.length || 0}/10)</h3>
              </div>
              {!settings?.heroImages?.length ? (
                <div className="empty-state"><ImageIcon size={40} /><p>No images yet</p></div>
              ) : (
                <div className="images-grid">
                  {[...settings.heroImages].sort((a,b)=>a.order-b.order).map((img, idx) => (
                    <div key={img._id} className="image-card">
                      <img src={img.url} alt={`Hero ${idx+1}`} />
                      <div className="image-overlay">
                        <span className="image-order">#{img.order}</span>
                        <button onClick={() => deleteHero(img._id)} className="btn-delete-image"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABOUT IMAGE ── */}
        {activeTab === 'about' && (
          <div className="settings-section">
            <h2>About Section Image</h2>
            <p className="section-description">Image shown in the About section on the home page.</p>
            <CurrentImg url={settings?.aboutImage?.url} alt="About" onDelete={async () => {
              if (!window.confirm('Delete?')) return;
              try { await settingsService.deleteAboutImage(); toast.success('Deleted'); fetchSettings(); }
              catch (e) { toast.error(e.message || 'Failed'); }
            }} />
            <UploadBox id="about-img" preview={aboutPreview} file={aboutFile}
              onChange={e => { const f=e.target.files[0]; if(f){setAboutFile(f);setAboutPreview(URL.createObjectURL(f));} }}
              onUpload={uploadAbout} onCancel={() => { setAboutFile(null); setAboutPreview(null); }}
              uploading={aboutUploading} placeholder="Click to upload about image" hint="Recommended: 800×600px" />
          </div>
        )}

        {/* ── CHAIRMAN / PRINCIPAL IMAGE ── */}
        {activeTab === 'chairman' && (
          <div className="settings-section">
            <h2>Principal Image — অধ্যক্ষের ছবি</h2>
            <div style={{background:'#e8f5e9',border:'1px solid #c8e6c9',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:14,color:'#1b5e20'}}>
              📌 This image appears in the <strong>"অধ্যক্ষের বাণী"</strong> section on the home page sidebar.
            </div>
            <CurrentImg url={settings?.chairmanImage?.url} alt="Principal" onDelete={deleteChairman} />
            <UploadBox id="chair-img" preview={chairPreview} file={chairFile}
              onChange={e => { const f=e.target.files[0]; if(f){setChairFile(f);setChairPreview(URL.createObjectURL(f));} }}
              onUpload={uploadChairman} onCancel={() => { setChairFile(null); setChairPreview(null); }}
              uploading={chairUploading} placeholder="Click to upload principal image" hint="Recommended: 400×400px (Square)" />
          </div>
        )}

        {/* ── PRESIDENT IMAGE (সভাপতির বাণী) ── */}
        {activeTab === 'president' && (
          <div className="settings-section">
            <h2>President Image — সভাপতির ছবি</h2>
            <div style={{background:'#e3f2fd',border:'1px solid #90caf9',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:14,color:'#0d47a1'}}>
              📌 This image appears in the <strong>"সভাপতির বাণী"</strong> section on the home page sidebar.<br/>
              (পরিচালনা পর্ষদের সভাপতি / Governing Body President)
            </div>
            <CurrentImg url={settings?.noticeImage?.url} alt="President" onDelete={deletePresident} />
            <UploadBox id="pres-img" preview={presPreview} file={presFile}
              onChange={e => { const f=e.target.files[0]; if(f){setPresFile(f);setPresPreview(URL.createObjectURL(f));} }}
              onUpload={uploadPresident} onCancel={() => { setPresFile(null); setPresPreview(null); }}
              uploading={presUploading} placeholder="Click to upload president image" hint="Recommended: 400×400px (Square)" />
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageSettings;