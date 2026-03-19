// FILE PATH: src/pages/Notices.js
// ✅ PDF / image upload via Cloudinary (attachments)
// ✅ Google Drive PDF link management (driveLinks)
// ✅ View modal: title + description + files + download buttons
// ✅ Beautiful two-section file area in create/edit form
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import noticeService from '../services/noticeService';
import toast from 'react-hot-toast';
import {
  Bell, Plus, Edit, Trash2, Eye, Calendar,
  FileText, Image as ImageIcon, Download,
  X, Link2, ChevronLeft, ChevronRight,
  ExternalLink, Upload, Paperclip, Globe,
  AlertCircle, CheckCircle
} from 'lucide-react';
import './Notices.css';

/* ── Constants ─────────────────────────────────────────── */
const TYPE_COLOR = {
  general:   '#3b82f6',
  urgent:    '#ef4444',
  holiday:   '#10b981',
  exam:      '#f59e0b',
  event:     '#6366f1',
  admission: '#8b5cf6',
};
const TYPE_LABEL = {
  general: 'General', urgent: 'Urgent', holiday: 'Holiday',
  exam: 'Exam', event: 'Event', admission: 'Admission',
};

const fmtDate = d => new Date(d).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
});
const truncate = (txt = '', n = 80) =>
  txt.length <= n ? txt : txt.slice(0, n) + '…';

const EMPTY_FORM = {
  title: '', description: '', type: 'general',
  publishDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
};

const getDriveEmbed = (url = '') => {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
};

/* ═══════════════════════════════════════════════════════════
   DRIVE LINK EDITOR ROW
═══════════════════════════════════════════════════════════ */
function DriveLinkEditor({ driveLinks, onChange }) {
  const add    = ()  => onChange([...driveLinks, { url: '', label: '' }]);
  const remove = (i) => onChange(driveLinks.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(driveLinks.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  return (
    <div className="file-section drive-section">
      <div className="file-sec-head">
        <Globe size={16} className="file-sec-icon drive" />
        <span>Google Drive PDF Links</span>
        <button type="button" className="btn-add-file-row" onClick={add}>
          <Plus size={13} /> লিংক যোগ করুন
        </button>
      </div>

      {driveLinks.length === 0 ? (
        <div className="file-sec-hint">
          <Globe size={18} color="#7c3aed" />
          <p>
            Google Drive-এ PDF upload করুন → <strong>Share → Anyone with the link</strong> করুন → লিংক এখানে paste করুন
          </p>
        </div>
      ) : (
        <div className="drive-rows">
          {driveLinks.map((lnk, i) => (
            <div key={i} className="drive-row">
              <div className="drive-row-inputs">
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={lnk.url}
                  onChange={e => update(i, 'url', e.target.value)}
                  className="drive-url-inp"
                />
                <input
                  type="text"
                  placeholder="লেবেল (যেমন: ভর্তি নোটিশ)"
                  value={lnk.label}
                  onChange={e => update(i, 'label', e.target.value)}
                  className="drive-lbl-inp"
                />
              </div>
              <div className="drive-row-actions">
                {lnk.url && (
                  <a href={lnk.url} target="_blank" rel="noopener noreferrer"
                    className="drive-preview-btn" title="Preview">
                    <ExternalLink size={14} />
                  </a>
                )}
                <button type="button" className="drive-remove-btn" onClick={() => remove(i)}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {driveLinks.length > 0 && (
        <div className="drive-tip">
          💡 Drive link preview — ব্যবহারকারীরা frontend থেকে সরাসরি PDF দেখতে ও ডাউনলোড করতে পারবেন।
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PDF / IMAGE UPLOAD SECTION
═══════════════════════════════════════════════════════════ */
function AttachmentUpload({ files, onChange, existingAttachments }) {
  const handleChange = e => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 5) {
      toast.error('সর্বোচ্চ ৫টি ফাইল আপলোড করা যাবে');
      return;
    }
    onChange([...files, ...selected]);
  };
  const removeNew = i => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="file-section upload-section">
      <div className="file-sec-head">
        <Upload size={16} className="file-sec-icon upload" />
        <span>PDF / ছবি আপলোড (Cloudinary)</span>
        <span className="file-count-badge">{files.length + (existingAttachments?.length || 0)} / 5</span>
      </div>

      {/* Upload dropzone */}
      <label className="upload-dropzone">
        <input
          type="file"
          accept=".pdf,image/*"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <Upload size={24} color="#6366f1" />
        <span className="dz-text">ক্লিক করুন অথবা ফাইল এখানে টেনে আনুন</span>
        <span className="dz-hint">PDF, JPG, PNG — সর্বোচ্চ ৫ MB প্রতিটি</span>
      </label>

      {/* Newly selected files */}
      {files.length > 0 && (
        <div className="file-preview-list">
          {files.map((f, i) => (
            <div key={i} className="file-preview-item new">
              {f.type === 'application/pdf'
                ? <FileText size={18} color="#ef4444" />
                : <ImageIcon size={18} color="#3b82f6" />
              }
              <span className="fp-name">{f.name}</span>
              <span className="fp-size">{(f.size / 1024).toFixed(0)} KB</span>
              <button type="button" className="fp-remove" onClick={() => removeNew(i)}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Existing attachments */}
      {existingAttachments?.length > 0 && (
        <div className="existing-files">
          <p className="existing-label">বিদ্যমান ফাইলসমূহ:</p>
          {existingAttachments.map((att, i) => (
            <div key={i} className="file-preview-item existing">
              {att.fileType === 'pdf'
                ? <FileText size={16} color="#ef4444" />
                : <ImageIcon size={16} color="#3b82f6" />
              }
              <span className="fp-name">{att.fileName || `File ${i + 1}`}</span>
              <a href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                className="fp-view-btn">
                <ExternalLink size={12} /> দেখুন
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const Notices = () => {
  const { user } = useSelector(s => s.auth);
  const [notices,        setNotices]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [viewMode,       setViewMode]       = useState(false);
  const [formData,       setFormData]       = useState({ ...EMPTY_FORM });
  const [files,          setFiles]          = useState([]);
  const [driveLinks,     setDriveLinks]     = useState([]);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [pagination,     setPagination]     = useState({ totalPages: 1, totalNotices: 0 });
  const [activeTab,      setActiveTab]      = useState('info'); // view modal tab
  const [submitting,     setSubmitting]     = useState(false);
  const LIMIT = 9;

  useEffect(() => { fetchNotices(1); }, []); // eslint-disable-line

  const fetchNotices = async (page) => {
    try {
      setLoading(true);
      const data = await noticeService.getAllNotices(page, LIMIT);
      setNotices(data.data || []);
      setPagination(data.pagination || { totalPages: 1, totalNotices: 0 });
      setCurrentPage(page);
    } catch { toast.error('Failed to fetch notices'); }
    finally { setLoading(false); }
  };

  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) { toast.error('শিরোনাম আবশ্যক'); return; }
    if (!formData.description?.trim()) { toast.error('বিবরণ আবশ্যক'); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      files.forEach(f => fd.append('attachments', f));
      fd.append('driveLinks', JSON.stringify(driveLinks.filter(l => l.url?.trim())));
      if (selectedNotice) {
        await noticeService.updateNotice(selectedNotice._id, fd);
        toast.success('নোটিশ আপডেট হয়েছে!');
      } else {
        await noticeService.createNotice(fd);
        toast.success('নোটিশ তৈরি হয়েছে!');
      }
      closeModal();
      fetchNotices(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notice');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('এই নোটিশ মুছে ফেলবেন?')) return;
    try {
      await noticeService.deleteNotice(id);
      toast.success('নোটিশ মুছে ফেলা হয়েছে');
      fetchNotices(currentPage);
    } catch { toast.error('Failed to delete notice'); }
  };

  const openView = (notice) => {
    setSelectedNotice(notice);
    setViewMode(true); setActiveTab('info'); setShowModal(true);
  };

  const openEdit = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      type: notice.type,
      publishDate: new Date(notice.publishDate).toISOString().split('T')[0],
      expiryDate: notice.expiryDate
        ? new Date(notice.expiryDate).toISOString().split('T')[0] : '',
    });
    setDriveLinks(notice.driveLinks || []);
    setFiles([]);
    setViewMode(false); setShowModal(true);
  };

  const openCreate = () => {
    setSelectedNotice(null);
    setFormData({ ...EMPTY_FORM });
    setDriveLinks([]); setFiles([]);
    setViewMode(false); setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setSelectedNotice(null); setViewMode(false);
  };

  /* ── Download Cloudinary file ── */
  const downloadFile = async (att) => {
    if (!att?.fileUrl) return;
    try {
      const res  = await fetch(att.fileUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = att.fileName || `notice-file.${att.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('ডাউনলোড শুরু হয়েছে');
    } catch { window.open(att.fileUrl, '_blank'); }
  };

  /* ── Pagination ── */
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    return (
      <div className="notices-pagination">
        <button className="pg-nav"
          disabled={currentPage === 1}
          onClick={() => fetchNotices(currentPage - 1)}>
          <ChevronLeft size={15} /> Prev
        </button>
        <div className="pg-numbers">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`pg-btn${p === currentPage ? ' active' : ''}`}
              onClick={() => fetchNotices(p)}>{p}</button>
          ))}
        </div>
        <button className="pg-nav"
          disabled={currentPage === pagination.totalPages}
          onClick={() => fetchNotices(currentPage + 1)}>
          Next <ChevronRight size={15} />
        </button>
      </div>
    );
  };

  /* ── VIEW MODAL CONTENT ── */
  const renderViewContent = () => {
    if (!selectedNotice) return null;
    const sn = selectedNotice;
    const tc = TYPE_COLOR[sn.type] || '#3b82f6';
    const hasDrive = sn.driveLinks?.length > 0;
    const hasFiles = sn.attachments?.length > 0;

    return (
      <>
        {/* Notice header */}
        <div className="nv-hd" style={{ borderTop: `5px solid ${tc}` }}>
          <div className="nv-hd-row">
            <span className={`notice-type-badge ${sn.type}`}
              style={{ background: tc }}>{TYPE_LABEL[sn.type] || sn.type}</span>
            <div className="nv-meta">
              <Calendar size={13} /> {fmtDate(sn.publishDate)}
              {sn.expiryDate && <span className="nv-expiry"> · Expires: {fmtDate(sn.expiryDate)}</span>}
            </div>
          </div>
          <h2 className="nv-title">{sn.title}</h2>
        </div>

        {/* View tabs */}
        <div className="nv-tabs">
          <button className={`nv-tab${activeTab === 'info' ? ' active' : ''}`}
            onClick={() => setActiveTab('info')}>
            📋 বিবরণ
          </button>
          {hasDrive && (
            <button className={`nv-tab${activeTab === 'drive' ? ' active' : ''}`}
              onClick={() => setActiveTab('drive')}>
              🌐 Drive PDFs
              <span className="nv-tc">{sn.driveLinks.length}</span>
            </button>
          )}
          {hasFiles && (
            <button className={`nv-tab${activeTab === 'files' ? ' active' : ''}`}
              onClick={() => setActiveTab('files')}>
              📎 Attachments
              <span className="nv-tc">{sn.attachments.length}</span>
            </button>
          )}
        </div>

        <div className="nv-body">
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="nv-info">
              <div className="nv-info-block">
                <p className="nv-lbl">শিরোনাম</p>
                <h3 className="nv-info-title">{sn.title}</h3>
              </div>
              <div className="nv-info-block">
                <p className="nv-lbl">বিবরণ</p>
                <p className="nv-desc">{sn.description || '—'}</p>
              </div>
              {(hasDrive || hasFiles) && (
                <div className="nv-shortcuts">
                  <p className="nv-lbl">সংযুক্ত ফাইল:</p>
                  <div className="nv-sc-pills">
                    {hasDrive && (
                      <button className="nv-sc-pill drive" onClick={() => setActiveTab('drive')}>
                        <Globe size={13} /> {sn.driveLinks.length} Drive PDF
                      </button>
                    )}
                    {hasFiles && (
                      <button className="nv-sc-pill files" onClick={() => setActiveTab('files')}>
                        <Paperclip size={13} /> {sn.attachments.length} Attachment
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DRIVE PDFs TAB */}
          {activeTab === 'drive' && (
            <div className="nv-drive-list">
              {sn.driveLinks?.map((lnk, i) => (
                <div key={i} className="nv-drive-card">
                  <div className="nv-drive-bar">
                    <Globe size={16} color="#7c3aed" />
                    <span className="nv-drive-name">{lnk.label || `PDF ${i + 1}`}</span>
                    <div className="nv-drive-btns">
                      <a href={lnk.url} target="_blank" rel="noopener noreferrer"
                        className="nv-dl-btn open">
                        <ExternalLink size={13} /> নতুন ট্যাবে খুলুন
                      </a>
                      <a href={lnk.url} download
                        target="_blank" rel="noopener noreferrer"
                        className="nv-dl-btn dl">
                        <Download size={13} /> ডাউনলোড
                      </a>
                    </div>
                  </div>
                  <div className="nv-drive-frame-wrap">
                    <iframe
                      src={getDriveEmbed(lnk.url)}
                      title={lnk.label || `Drive PDF ${i + 1}`}
                      className="nv-drive-iframe"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ATTACHMENTS TAB */}
          {activeTab === 'files' && (
            <div className="nv-att-list">
              {sn.attachments?.map((att, i) => {
                const isImg = att.fileType === 'image' || !att.fileType?.includes('pdf');
                return (
                  <div key={i} className="nv-att-card">
                    {/* Preview */}
                    {isImg && att.fileUrl ? (
                      <div className="nv-att-thumb">
                        <img src={att.fileUrl} alt={att.fileName || 'attachment'} />
                      </div>
                    ) : (
                      <div className="nv-att-pdf-icon">
                        <FileText size={36} color="#ef4444" />
                        <span>PDF</span>
                      </div>
                    )}

                    {/* Info + buttons */}
                    <div className="nv-att-info">
                      <div className="nv-att-name-row">
                        {isImg
                          ? <ImageIcon size={15} color="#3b82f6" />
                          : <FileText size={15} color="#ef4444" />
                        }
                        <span className="nv-att-name">
                          {att.fileName || (isImg ? 'Image' : 'PDF File')}
                        </span>
                      </div>
                      <div className="nv-att-btns">
                        {att.fileUrl && (
                          <>
                            <a href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="nv-att-btn view">
                              <ExternalLink size={13} /> দেখুন
                            </a>
                            <button className="nv-att-btn dl" onClick={() => downloadFile(att)}>
                              <Download size={13} /> ডাউনলোড
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="nv-footer">
          <button className="btn-secondary" onClick={closeModal}>বন্ধ করুন</button>
          <button className="btn-primary" onClick={() => { closeModal(); openEdit(sn); }}>
            <Edit size={15} /> নোটিশ সম্পাদনা
          </button>
        </div>
      </>
    );
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="notices-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="header-left">
          <Bell size={30} />
          <div>
            <h1>Notice Management</h1>
            <p>{pagination.totalNotices} total notices</p>
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> নোটিশ তৈরি করুন
        </button>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="no-data">
          <Bell size={48} />
          <p>No notices found. Create your first notice!</p>
        </div>
      ) : (
        <>
          <div className="notices-grid">
            {notices.map(notice => (
              <div key={notice._id} className="notice-card"
                style={{ '--tc': TYPE_COLOR[notice.type] || '#3b82f6' }}>
                <div className="nc-top-bar" />
                <div className="nc-header">
                  <span className={`notice-type-badge ${notice.type}`}>
                    {TYPE_LABEL[notice.type] || notice.type}
                  </span>
                  <div className="notice-date">
                    <Calendar size={12} /> {fmtDate(notice.publishDate)}
                  </div>
                </div>
                <div className="nc-body">
                  <h3 className="nc-title" onClick={() => openView(notice)}>
                    {notice.title}
                  </h3>
                  <p className="nc-desc">{truncate(notice.description || '', 80)}</p>
                  <div className="nc-file-info">
                    {notice.attachments?.length > 0 && (
                      <span className="nc-att-badge">
                        📎 {notice.attachments.length} ফাইল
                      </span>
                    )}
                    {notice.driveLinks?.length > 0 && (
                      <span className="nc-drive-badge">
                        🌐 {notice.driveLinks.length} Drive PDF
                      </span>
                    )}
                  </div>
                </div>
                <div className="notice-card-actions">
                  <button className="btn-icon btn-view" onClick={() => openView(notice)} title="View">
                    <Eye size={15} />
                  </button>
                  <button className="btn-icon btn-edit" onClick={() => openEdit(notice)} title="Edit">
                    <Edit size={15} />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(notice._id)} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}

      {/* ══ MODAL ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className={`modal-content${viewMode ? ' view-modal' : ' form-modal'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="modal-header">
              <h2>
                {viewMode
                  ? '📋 নোটিশ দেখুন'
                  : selectedNotice ? '✏️ নোটিশ সম্পাদনা' : '➕ নতুন নোটিশ'}
              </h2>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>

            {/* ─── VIEW MODE ─── */}
            {viewMode ? (
              renderViewContent()
            ) : (
              /* ─── CREATE / EDIT FORM ─── */
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-grid">
                  {/* Title */}
                  <div className="form-group full-width">
                    <label>শিরোনাম <span className="req">*</span></label>
                    <input type="text" name="title" value={formData.title}
                      onChange={handleChange} placeholder="নোটিশের শিরোনাম লিখুন" required />
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>বিবরণ <span className="req">*</span></label>
                    <textarea name="description" value={formData.description}
                      onChange={handleChange} rows="4"
                      placeholder="নোটিশের বিস্তারিত বিবরণ লিখুন" required />
                  </div>

                  {/* Type */}
                  <div className="form-group">
                    <label>ধরন</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                      {Object.entries(TYPE_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Publish Date */}
                  <div className="form-group">
                    <label>প্রকাশের তারিখ</label>
                    <input type="date" name="publishDate" value={formData.publishDate}
                      onChange={handleChange} />
                  </div>

                  {/* Expiry */}
                  <div className="form-group">
                    <label>মেয়াদ শেষের তারিখ (ঐচ্ছিক)</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate}
                      onChange={handleChange} />
                  </div>

                  {/* ─── FILE SECTIONS ─── */}
                  <div className="form-group full-width files-area">
                    <label className="files-area-label">
                      <Paperclip size={15} /> সংযুক্তি / ফাইলসমূহ
                    </label>
                    <div className="files-area-grid">
                      {/* Cloudinary Upload */}
                      <AttachmentUpload
                        files={files}
                        onChange={setFiles}
                        existingAttachments={selectedNotice?.attachments}
                      />
                      {/* Drive Links */}
                      <DriveLinkEditor driveLinks={driveLinks} onChange={setDriveLinks} />
                    </div>
                  </div>
                </div>

                {/* Form actions */}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    বাতিল
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting
                      ? <><span className="btn-spinner" /> সংরক্ষণ হচ্ছে...</>
                      : selectedNotice ? 'আপডেট করুন' : 'নোটিশ তৈরি করুন'
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;


// // FILE PATH: src/pages/Notices.js  ← FRONTEND
// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import noticeService from '../services/noticeService';
// import toast from 'react-hot-toast';
// import {
//   Bell, Plus, Edit, Trash2, Eye, Calendar,
//   FileText, Image as ImageIcon, Download,
//   X, Link, ChevronLeft, ChevronRight, ExternalLink
// } from 'lucide-react';
// import './Notices.css';

// const TYPE_COLOR = {
//   general:   '#3b82f6',
//   urgent:    '#ef4444',
//   holiday:   '#10b981',
//   exam:      '#f59e0b',
//   event:     '#6366f1',
//   admission: '#8b5cf6',
// };

// const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', {
//   day: 'numeric', month: 'short', year: 'numeric'
// });

// const truncateWords = (text, n) => {
//   if (!text) return '';
//   const words = text.trim().split(/\s+/);
//   return words.length <= n ? text : words.slice(0, n).join(' ') + '…';
// };

// const EMPTY_FORM = {
//   title: '', description: '', type: 'general',
//   publishDate: new Date().toISOString().split('T')[0],
//   expiryDate: ''
// };

// // ── Drive link row editor ──────────────────────────────────
// const DriveLinkEditor = ({ driveLinks, onChange }) => {
//   const addLink    = () => onChange([...driveLinks, { url: '', label: '' }]);
//   const removeLink = (i) => onChange(driveLinks.filter((_, idx) => idx !== i));
//   const updateLink = (i, field, val) => {
//     const updated = driveLinks.map((l, idx) =>
//       idx === i ? { ...l, [field]: val } : l
//     );
//     onChange(updated);
//   };

//   return (
//     <div className="drive-link-editor">
//       <div className="drive-link-header">
//         <span>
//           <Link size={15} />
//           Google Drive PDF Links
//         </span>
//         <button type="button" className="btn-add-link" onClick={addLink}>
//           + Add Link
//         </button>
//       </div>
//       {driveLinks.map((link, i) => (
//         <div key={i} className="drive-link-row">
//           <input
//             type="url"
//             placeholder="Google Drive share link (https://drive.google.com/...)"
//             value={link.url}
//             onChange={e => updateLink(i, 'url', e.target.value)}
//             className="drive-url-input"
//           />
//           <input
//             type="text"
//             placeholder="Label (e.g. Notice PDF)"
//             value={link.label}
//             onChange={e => updateLink(i, 'label', e.target.value)}
//             className="drive-label-input"
//           />
//           <button
//             type="button"
//             className="btn-remove-link"
//             onClick={() => removeLink(i)}
//           >
//             <X size={14} />
//           </button>
//         </div>
//       ))}
//       {driveLinks.length === 0 && (
//         <p className="drive-link-hint">
//           Google Drive-এ PDF upload করে "Share → Anyone with link" করুন, তারপর link এখানে দিন।
//         </p>
//       )}
//     </div>
//   );
// };

// // ══════════════════════════════════════════════════════════
// const Notices = () => {
//   const { user } = useSelector(s => s.auth);
//   const [notices,         setNotices]         = useState([]);
//   const [loading,         setLoading]         = useState(true);
//   const [showModal,       setShowModal]       = useState(false);
//   const [selectedNotice,  setSelectedNotice]  = useState(null);
//   const [viewMode,        setViewMode]        = useState(false);
//   const [formData,        setFormData]        = useState({ ...EMPTY_FORM });
//   const [files,           setFiles]           = useState([]);
//   const [driveLinks,      setDriveLinks]      = useState([]);
//   const [currentPage,     setCurrentPage]     = useState(1);
//   const [pagination,      setPagination]      = useState({ totalPages: 1, totalNotices: 0 });
//   const LIMIT = 9;

//   useEffect(() => { fetchNotices(1); }, []);

//   const fetchNotices = async (page) => {
//     try {
//       setLoading(true);
//       const data = await noticeService.getAllNotices(page, LIMIT);
//       setNotices(data.data || []);
//       setPagination(data.pagination || { totalPages: 1, totalNotices: 0 });
//       setCurrentPage(page);
//     } catch {
//       toast.error('Failed to fetch notices');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = e =>
//     setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

//   const handleFileChange = e => setFiles(Array.from(e.target.files));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.description) {
//       toast.error('Title and Description are required');
//       return;
//     }
//     try {
//       const fd = new FormData();
//       Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
//       files.forEach(f => fd.append('attachments', f));
//       // Send driveLinks as JSON string
//       fd.append('driveLinks', JSON.stringify(
//         driveLinks.filter(l => l.url.trim())
//       ));

//       if (selectedNotice) {
//         await noticeService.updateNotice(selectedNotice._id, fd);
//         toast.success('Notice updated!');
//       } else {
//         await noticeService.createNotice(fd);
//         toast.success('Notice created!');
//       }
//       closeModal();
//       fetchNotices(currentPage);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save notice');
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this notice?')) return;
//     try {
//       await noticeService.deleteNotice(id);
//       toast.success('Notice deleted');
//       fetchNotices(currentPage);
//     } catch {
//       toast.error('Failed to delete notice');
//     }
//   };

//   const openView = (notice) => {
//     setSelectedNotice(notice);
//     setViewMode(true);
//     setShowModal(true);
//   };

//   const openEdit = (notice) => {
//     setSelectedNotice(notice);
//     setFormData({
//       title: notice.title,
//       description: notice.description,
//       type: notice.type,
//       publishDate: new Date(notice.publishDate).toISOString().split('T')[0],
//       expiryDate: notice.expiryDate
//         ? new Date(notice.expiryDate).toISOString().split('T')[0] : ''
//     });
//     setDriveLinks(notice.driveLinks || []);
//     setFiles([]);
//     setViewMode(false);
//     setShowModal(true);
//   };

//   const openCreate = () => {
//     setSelectedNotice(null);
//     setFormData({ ...EMPTY_FORM });
//     setDriveLinks([]);
//     setFiles([]);
//     setViewMode(false);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedNotice(null);
//     setViewMode(false);
//   };

//   const getDriveEmbedUrl = (url) => {
//     if (!url) return '';
//     const m = url.match(/\/d\/([^/]+)/);
//     if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
//     return url;
//   };

//   const getFileIcon = (type) =>
//     type === 'pdf' ? <FileText size={18} /> : <ImageIcon size={18} />;

//   // ── Pagination ──────────────────────────────────────────
//   const renderPagination = () => {
//     if (pagination.totalPages <= 1) return null;
//     return (
//       <div className="notices-pagination">
//         <button
//           className="pg-nav"
//           disabled={currentPage === 1}
//           onClick={() => fetchNotices(currentPage - 1)}
//         >
//           <ChevronLeft size={16} /> Prev
//         </button>
//         <div className="pg-numbers">
//           {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
//             <button
//               key={p}
//               className={`pg-btn${p === currentPage ? ' active' : ''}`}
//               onClick={() => fetchNotices(p)}
//             >{p}</button>
//           ))}
//         </div>
//         <button
//           className="pg-nav"
//           disabled={currentPage === pagination.totalPages}
//           onClick={() => fetchNotices(currentPage + 1)}
//         >
//           Next <ChevronRight size={16} />
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="notices-page">
//       {/* ── Header ── */}
//       <div className="page-header">
//         <div className="header-left">
//           <Bell size={30} />
//           <div>
//             <h1>Notice Management</h1>
//             <p>{pagination.totalNotices} total notices</p>
//           </div>
//         </div>
//         <button className="btn-primary" onClick={openCreate}>
//           <Plus size={18} /> Create Notice
//         </button>
//       </div>

//       {/* ── Grid ── */}
//       {loading ? (
//         <div className="loading-container">
//           <div className="spinner" />
//           <p>Loading notices...</p>
//         </div>
//       ) : notices.length === 0 ? (
//         <div className="no-data">
//           <Bell size={48} />
//           <p>No notices found</p>
//         </div>
//       ) : (
//         <>
//           <div className="notices-grid">
//             {notices.map(notice => (
//               <div
//                 key={notice._id}
//                 className="notice-card"
//                 style={{ '--tc': TYPE_COLOR[notice.type] || '#3b82f6' }}
//               >
//                 {/* Top color bar */}
//                 <div className="nc-top-bar" />

//                 <div className="nc-header">
//                   <span className={`notice-type-badge ${notice.type}`}>
//                     {notice.type}
//                   </span>
//                   <div className="notice-date">
//                     <Calendar size={13} />
//                     {fmtDate(notice.publishDate)}
//                   </div>
//                 </div>

//                 {/* ✅ Title clickable → view */}
//                 <div className="nc-body">
//                   <h3
//                     className="nc-title"
//                     onClick={() => openView(notice)}
//                     title={notice.title}
//                   >
//                     {truncateWords(notice.title, 10)}
//                   </h3>
//                   <p className="nc-desc">
//                     {notice.description?.substring(0, 80)}
//                     {notice.description?.length > 80 ? '…' : ''}
//                   </p>

//                   <div className="nc-file-info">
//                     {notice.attachments?.length > 0 && (
//                       <span className="nc-att-badge">
//                         📎 {notice.attachments.length} file
//                       </span>
//                     )}
//                     {notice.driveLinks?.length > 0 && (
//                       <span className="nc-drive-badge">
//                         🔗 {notice.driveLinks.length} Drive PDF
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="notice-card-actions">
//                   <button className="btn-icon btn-view"
//                     onClick={() => openView(notice)} title="View">
//                     <Eye size={16} />
//                   </button>
//                   <button className="btn-icon btn-edit"
//                     onClick={() => openEdit(notice)} title="Edit">
//                     <Edit size={16} />
//                   </button>
//                   <button className="btn-icon btn-delete"
//                     onClick={() => handleDelete(notice._id)} title="Delete">
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {renderPagination()}
//         </>
//       )}

//       {/* ══════ MODAL ══════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className={`modal-content large${viewMode ? ' view-modal' : ''}`}
//             onClick={e => e.stopPropagation()}>

//             <div className="modal-header">
//               <h2>
//                 {viewMode
//                   ? '📋 View Notice'
//                   : selectedNotice ? '✏️ Edit Notice' : '➕ Create Notice'}
//               </h2>
//               <button className="close-btn" onClick={closeModal}>
//                 <X size={22} />
//               </button>
//             </div>

//             <div className="modal-body">
//               {/* ─── VIEW MODE ─── */}
//               {viewMode ? (
//                 <div className="notice-view">
//                   <div className="view-header">
//                     <span
//                       className={`notice-type-badge ${selectedNotice.type}`}
//                       style={{ background: TYPE_COLOR[selectedNotice.type] }}
//                     >
//                       {selectedNotice.type}
//                     </span>
//                     <h2>{selectedNotice.title}</h2>
//                   </div>

//                   <div className="view-meta">
//                     <span><Calendar size={14} /> {fmtDate(selectedNotice.publishDate)}</span>
//                     {selectedNotice.expiryDate && (
//                       <span>Expires: {fmtDate(selectedNotice.expiryDate)}</span>
//                     )}
//                   </div>

//                   {/* ✅ Description */}
//                   <div className="view-description">
//                     <h4>Description</h4>
//                     <p>{selectedNotice.description}</p>
//                   </div>

//                   {/* Cloudinary Attachments */}
//                   {selectedNotice.attachments?.length > 0 && (
//                     <div className="view-attachments">
//                       <h4>📎 Attachments</h4>
//                       {selectedNotice.attachments.map((att, i) => (
//                         <div key={i} className="attachment-item">
//                           {getFileIcon(att.fileType)}
//                           <span>{att.fileName || `File ${i + 1}`}</span>
//                           <a href={att.fileUrl} target="_blank"
//                             rel="noopener noreferrer" className="btn-download">
//                             <Download size={14} /> Download
//                           </a>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {/* ✅ Google Drive PDFs embedded */}
//                   {selectedNotice.driveLinks?.length > 0 && (
//                     <div className="view-drive-links">
//                       <h4>🔗 Google Drive PDFs</h4>
//                       {selectedNotice.driveLinks.map((link, i) => (
//                         <div key={i} className="drive-pdf-viewer">
//                           <div className="drive-pdf-label">
//                             <ExternalLink size={15} />
//                             <span>{link.label || `PDF ${i + 1}`}</span>
//                             <a href={link.url} target="_blank"
//                               rel="noopener noreferrer" className="btn-open-drive">
//                               Open in Drive
//                             </a>
//                           </div>
//                           <iframe
//                             src={getDriveEmbedUrl(link.url)}
//                             title={link.label || `Drive PDF ${i + 1}`}
//                             className="drive-iframe"
//                             allow="autoplay"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   <div className="view-actions">
//                     <button className="btn-secondary" onClick={closeModal}>Close</button>
//                     <button className="btn-primary" onClick={() => { closeModal(); openEdit(selectedNotice); }}>
//                       <Edit size={16} /> Edit Notice
//                     </button>
//                   </div>
//                 </div>

//               ) : (
//                 /* ─── CREATE/EDIT FORM ─── */
//                 <form onSubmit={handleSubmit}>
//                   <div className="form-grid">
//                     <div className="form-group full-width">
//                       <label>Notice Title *</label>
//                       <input type="text" name="title" value={formData.title}
//                         onChange={handleChange} placeholder="Enter notice title" required />
//                     </div>

//                     <div className="form-group full-width">
//                       <label>Description *</label>
//                       <textarea name="description" value={formData.description}
//                         onChange={handleChange} rows="5"
//                         placeholder="Enter notice description" required />
//                     </div>

//                     <div className="form-group">
//                       <label>Notice Type</label>
//                       <select name="type" value={formData.type} onChange={handleChange}>
//                         <option value="general">General</option>
//                         <option value="urgent">Urgent</option>
//                         <option value="holiday">Holiday</option>
//                         <option value="exam">Exam</option>
//                         <option value="event">Event</option>
//                         <option value="admission">Admission</option>
//                       </select>
//                     </div>

//                     <div className="form-group">
//                       <label>Publish Date</label>
//                       <input type="date" name="publishDate" value={formData.publishDate}
//                         onChange={handleChange} />
//                     </div>

//                     <div className="form-group">
//                       <label>Expiry Date (Optional)</label>
//                       <input type="date" name="expiryDate" value={formData.expiryDate}
//                         onChange={handleChange} />
//                     </div>

//                     <div className="form-group full-width">
//                       <label>Attachments — Image / PDF via Cloudinary (max 5)</label>
//                       <input type="file" accept=".pdf,image/*" multiple
//                         onChange={handleFileChange} />
//                       {files.length > 0 && (
//                         <div className="selected-files">
//                           {files.map((f, i) => (
//                             <span key={i} className="file-tag">{f.name}</span>
//                           ))}
//                         </div>
//                       )}
//                       {selectedNotice?.attachments?.length > 0 && (
//                         <div className="existing-attachments" style={{ marginTop: 8 }}>
//                           <label style={{ fontSize: 12, color: '#64748b' }}>Existing files:</label>
//                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
//                             {selectedNotice.attachments.map((att, i) => (
//                               <div key={i} className="existing-attachment-item">
//                                 {getFileIcon(att.fileType)}
//                                 <span>{att.fileName || `File ${i + 1}`}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* ✅ Google Drive Links */}
//                     <div className="form-group full-width">
//                       <DriveLinkEditor
//                         driveLinks={driveLinks}
//                         onChange={setDriveLinks}
//                       />
//                     </div>
//                   </div>

//                   <div className="modal-actions">
//                     <button type="button" className="btn-secondary" onClick={closeModal}>
//                       Cancel
//                     </button>
//                     <button type="submit" className="btn-primary">
//                       {selectedNotice ? 'Update Notice' : 'Create Notice'}
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Notices;