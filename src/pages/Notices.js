// FILE PATH: src/pages/Notices.js  ← FRONTEND
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import noticeService from '../services/noticeService';
import toast from 'react-hot-toast';
import {
  Bell, Plus, Edit, Trash2, Eye, Calendar,
  FileText, Image as ImageIcon, Download,
  X, Link, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import './Notices.css';

const TYPE_COLOR = {
  general:   '#3b82f6',
  urgent:    '#ef4444',
  holiday:   '#10b981',
  exam:      '#f59e0b',
  event:     '#6366f1',
  admission: '#8b5cf6',
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
});

const truncateWords = (text, n) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= n ? text : words.slice(0, n).join(' ') + '…';
};

const EMPTY_FORM = {
  title: '', description: '', type: 'general',
  publishDate: new Date().toISOString().split('T')[0],
  expiryDate: ''
};

// ── Drive link row editor ──────────────────────────────────
const DriveLinkEditor = ({ driveLinks, onChange }) => {
  const addLink    = () => onChange([...driveLinks, { url: '', label: '' }]);
  const removeLink = (i) => onChange(driveLinks.filter((_, idx) => idx !== i));
  const updateLink = (i, field, val) => {
    const updated = driveLinks.map((l, idx) =>
      idx === i ? { ...l, [field]: val } : l
    );
    onChange(updated);
  };

  return (
    <div className="drive-link-editor">
      <div className="drive-link-header">
        <span>
          <Link size={15} />
          Google Drive PDF Links
        </span>
        <button type="button" className="btn-add-link" onClick={addLink}>
          + Add Link
        </button>
      </div>
      {driveLinks.map((link, i) => (
        <div key={i} className="drive-link-row">
          <input
            type="url"
            placeholder="Google Drive share link (https://drive.google.com/...)"
            value={link.url}
            onChange={e => updateLink(i, 'url', e.target.value)}
            className="drive-url-input"
          />
          <input
            type="text"
            placeholder="Label (e.g. Notice PDF)"
            value={link.label}
            onChange={e => updateLink(i, 'label', e.target.value)}
            className="drive-label-input"
          />
          <button
            type="button"
            className="btn-remove-link"
            onClick={() => removeLink(i)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {driveLinks.length === 0 && (
        <p className="drive-link-hint">
          Google Drive-এ PDF upload করে "Share → Anyone with link" করুন, তারপর link এখানে দিন।
        </p>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
const Notices = () => {
  const { user } = useSelector(s => s.auth);
  const [notices,         setNotices]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [selectedNotice,  setSelectedNotice]  = useState(null);
  const [viewMode,        setViewMode]        = useState(false);
  const [formData,        setFormData]        = useState({ ...EMPTY_FORM });
  const [files,           setFiles]           = useState([]);
  const [driveLinks,      setDriveLinks]      = useState([]);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [pagination,      setPagination]      = useState({ totalPages: 1, totalNotices: 0 });
  const LIMIT = 9;

  useEffect(() => { fetchNotices(1); }, []);

  const fetchNotices = async (page) => {
    try {
      setLoading(true);
      const data = await noticeService.getAllNotices(page, LIMIT);
      setNotices(data.data || []);
      setPagination(data.pagination || { totalPages: 1, totalNotices: 0 });
      setCurrentPage(page);
    } catch {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = e => setFiles(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and Description are required');
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      files.forEach(f => fd.append('attachments', f));
      // Send driveLinks as JSON string
      fd.append('driveLinks', JSON.stringify(
        driveLinks.filter(l => l.url.trim())
      ));

      if (selectedNotice) {
        await noticeService.updateNotice(selectedNotice._id, fd);
        toast.success('Notice updated!');
      } else {
        await noticeService.createNotice(fd);
        toast.success('Notice created!');
      }
      closeModal();
      fetchNotices(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await noticeService.deleteNotice(id);
      toast.success('Notice deleted');
      fetchNotices(currentPage);
    } catch {
      toast.error('Failed to delete notice');
    }
  };

  const openView = (notice) => {
    setSelectedNotice(notice);
    setViewMode(true);
    setShowModal(true);
  };

  const openEdit = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      type: notice.type,
      publishDate: new Date(notice.publishDate).toISOString().split('T')[0],
      expiryDate: notice.expiryDate
        ? new Date(notice.expiryDate).toISOString().split('T')[0] : ''
    });
    setDriveLinks(notice.driveLinks || []);
    setFiles([]);
    setViewMode(false);
    setShowModal(true);
  };

  const openCreate = () => {
    setSelectedNotice(null);
    setFormData({ ...EMPTY_FORM });
    setDriveLinks([]);
    setFiles([]);
    setViewMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
    setViewMode(false);
  };

  const getDriveEmbedUrl = (url) => {
    if (!url) return '';
    const m = url.match(/\/d\/([^/]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    return url;
  };

  const getFileIcon = (type) =>
    type === 'pdf' ? <FileText size={18} /> : <ImageIcon size={18} />;

  // ── Pagination ──────────────────────────────────────────
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    return (
      <div className="notices-pagination">
        <button
          className="pg-nav"
          disabled={currentPage === 1}
          onClick={() => fetchNotices(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="pg-numbers">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`pg-btn${p === currentPage ? ' active' : ''}`}
              onClick={() => fetchNotices(p)}
            >{p}</button>
          ))}
        </div>
        <button
          className="pg-nav"
          disabled={currentPage === pagination.totalPages}
          onClick={() => fetchNotices(currentPage + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="notices-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="header-left">
          <Bell size={30} />
          <div>
            <h1>Notice Management</h1>
            <p>{pagination.totalNotices} total notices</p>
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Create Notice
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
          <p>No notices found</p>
        </div>
      ) : (
        <>
          <div className="notices-grid">
            {notices.map(notice => (
              <div
                key={notice._id}
                className="notice-card"
                style={{ '--tc': TYPE_COLOR[notice.type] || '#3b82f6' }}
              >
                {/* Top color bar */}
                <div className="nc-top-bar" />

                <div className="nc-header">
                  <span className={`notice-type-badge ${notice.type}`}>
                    {notice.type}
                  </span>
                  <div className="notice-date">
                    <Calendar size={13} />
                    {fmtDate(notice.publishDate)}
                  </div>
                </div>

                {/* ✅ Title clickable → view */}
                <div className="nc-body">
                  <h3
                    className="nc-title"
                    onClick={() => openView(notice)}
                    title={notice.title}
                  >
                    {truncateWords(notice.title, 10)}
                  </h3>
                  <p className="nc-desc">
                    {notice.description?.substring(0, 80)}
                    {notice.description?.length > 80 ? '…' : ''}
                  </p>

                  <div className="nc-file-info">
                    {notice.attachments?.length > 0 && (
                      <span className="nc-att-badge">
                        📎 {notice.attachments.length} file
                      </span>
                    )}
                    {notice.driveLinks?.length > 0 && (
                      <span className="nc-drive-badge">
                        🔗 {notice.driveLinks.length} Drive PDF
                      </span>
                    )}
                  </div>
                </div>

                <div className="notice-card-actions">
                  <button className="btn-icon btn-view"
                    onClick={() => openView(notice)} title="View">
                    <Eye size={16} />
                  </button>
                  <button className="btn-icon btn-edit"
                    onClick={() => openEdit(notice)} title="Edit">
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon btn-delete"
                    onClick={() => handleDelete(notice._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}

      {/* ══════ MODAL ══════ */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-content large${viewMode ? ' view-modal' : ''}`}
            onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h2>
                {viewMode
                  ? '📋 View Notice'
                  : selectedNotice ? '✏️ Edit Notice' : '➕ Create Notice'}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {/* ─── VIEW MODE ─── */}
              {viewMode ? (
                <div className="notice-view">
                  <div className="view-header">
                    <span
                      className={`notice-type-badge ${selectedNotice.type}`}
                      style={{ background: TYPE_COLOR[selectedNotice.type] }}
                    >
                      {selectedNotice.type}
                    </span>
                    <h2>{selectedNotice.title}</h2>
                  </div>

                  <div className="view-meta">
                    <span><Calendar size={14} /> {fmtDate(selectedNotice.publishDate)}</span>
                    {selectedNotice.expiryDate && (
                      <span>Expires: {fmtDate(selectedNotice.expiryDate)}</span>
                    )}
                  </div>

                  {/* ✅ Description */}
                  <div className="view-description">
                    <h4>Description</h4>
                    <p>{selectedNotice.description}</p>
                  </div>

                  {/* Cloudinary Attachments */}
                  {selectedNotice.attachments?.length > 0 && (
                    <div className="view-attachments">
                      <h4>📎 Attachments</h4>
                      {selectedNotice.attachments.map((att, i) => (
                        <div key={i} className="attachment-item">
                          {getFileIcon(att.fileType)}
                          <span>{att.fileName || `File ${i + 1}`}</span>
                          <a href={att.fileUrl} target="_blank"
                            rel="noopener noreferrer" className="btn-download">
                            <Download size={14} /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ✅ Google Drive PDFs embedded */}
                  {selectedNotice.driveLinks?.length > 0 && (
                    <div className="view-drive-links">
                      <h4>🔗 Google Drive PDFs</h4>
                      {selectedNotice.driveLinks.map((link, i) => (
                        <div key={i} className="drive-pdf-viewer">
                          <div className="drive-pdf-label">
                            <ExternalLink size={15} />
                            <span>{link.label || `PDF ${i + 1}`}</span>
                            <a href={link.url} target="_blank"
                              rel="noopener noreferrer" className="btn-open-drive">
                              Open in Drive
                            </a>
                          </div>
                          <iframe
                            src={getDriveEmbedUrl(link.url)}
                            title={link.label || `Drive PDF ${i + 1}`}
                            className="drive-iframe"
                            allow="autoplay"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="view-actions">
                    <button className="btn-secondary" onClick={closeModal}>Close</button>
                    <button className="btn-primary" onClick={() => { closeModal(); openEdit(selectedNotice); }}>
                      <Edit size={16} /> Edit Notice
                    </button>
                  </div>
                </div>

              ) : (
                /* ─── CREATE/EDIT FORM ─── */
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Notice Title *</label>
                      <input type="text" name="title" value={formData.title}
                        onChange={handleChange} placeholder="Enter notice title" required />
                    </div>

                    <div className="form-group full-width">
                      <label>Description *</label>
                      <textarea name="description" value={formData.description}
                        onChange={handleChange} rows="5"
                        placeholder="Enter notice description" required />
                    </div>

                    <div className="form-group">
                      <label>Notice Type</label>
                      <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="general">General</option>
                        <option value="urgent">Urgent</option>
                        <option value="holiday">Holiday</option>
                        <option value="exam">Exam</option>
                        <option value="event">Event</option>
                        <option value="admission">Admission</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Publish Date</label>
                      <input type="date" name="publishDate" value={formData.publishDate}
                        onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label>Expiry Date (Optional)</label>
                      <input type="date" name="expiryDate" value={formData.expiryDate}
                        onChange={handleChange} />
                    </div>

                    <div className="form-group full-width">
                      <label>Attachments — Image / PDF via Cloudinary (max 5)</label>
                      <input type="file" accept=".pdf,image/*" multiple
                        onChange={handleFileChange} />
                      {files.length > 0 && (
                        <div className="selected-files">
                          {files.map((f, i) => (
                            <span key={i} className="file-tag">{f.name}</span>
                          ))}
                        </div>
                      )}
                      {selectedNotice?.attachments?.length > 0 && (
                        <div className="existing-attachments" style={{ marginTop: 8 }}>
                          <label style={{ fontSize: 12, color: '#64748b' }}>Existing files:</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {selectedNotice.attachments.map((att, i) => (
                              <div key={i} className="existing-attachment-item">
                                {getFileIcon(att.fileType)}
                                <span>{att.fileName || `File ${i + 1}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ Google Drive Links */}
                    <div className="form-group full-width">
                      <DriveLinkEditor
                        driveLinks={driveLinks}
                        onChange={setDriveLinks}
                      />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {selectedNotice ? 'Update Notice' : 'Create Notice'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;