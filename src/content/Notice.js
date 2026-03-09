// FILE PATH: src/content/Notice.js
import React, { useState, useEffect, useCallback } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import noticeService from '../services/noticeService';
import {
  FileText, Download, Calendar, Bell,
  Image as ImageIcon, ChevronLeft, ChevronRight,
  X, ExternalLink, Clock, ZoomIn, ZoomOut, Loader,
} from 'lucide-react';
import './Notice.css';

/* ── helpers ── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const wordLimit = (text = '', n = 10) => {
  const w = text.trim().split(/\s+/);
  return w.length <= n ? text : w.slice(0, n).join(' ') + '\u2026';
};

const isNew7 = (d) => (Date.now() - new Date(d)) < 7 * 24 * 60 * 60 * 1000;

// Any Drive share/view URL → embeddable preview
const toDriveEmbed = (url = '') => {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
};

const TYPE_CFG = {
  general:   { bg: '#e3f2fd', color: '#1565c0', label: 'General'   },
  urgent:    { bg: '#ffebee', color: '#c62828', label: 'Urgent'    },
  exam:      { bg: '#fff3e0', color: '#e65100', label: 'Exam'      },
  holiday:   { bg: '#f3e5f5', color: '#7b1fa2', label: 'Holiday'   },
  event:     { bg: '#e8f5e9', color: '#2e7d32', label: 'Event'     },
  admission: { bg: '#fce4ec', color: '#c2185b', label: 'Admission' },
};

/* =============================================================
   NoticeModal
   Tab 1 — বিবরণ   : description (from backend)
   Tab 2 — PDF     : Google Drive iframe (full-width)
   Tab 3 — Files   : Cloudinary image/pdf — view + download
============================================================= */
const NoticeModal = ({ notice, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [viewFile,    setViewFile]    = useState(null);
  const [imgScale,    setImgScale]    = useState(1);
  const [imgLoaded,   setImgLoaded]   = useState(false);
  const [pdfErr,      setPdfErr]      = useState(false);

  const hasDrive = notice.driveLinks?.length > 0;
  const hasFiles = notice.attachments?.length > 0;
  const [tab, setTab] = useState(
    hasDrive ? 'drive' : hasFiles ? 'files' : 'info'
  );
  const tc = TYPE_CFG[notice.type] || TYPE_CFG.general;

  useEffect(() => { setImgScale(1); setImgLoaded(false); setPdfErr(false); }, [viewFile]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { if (viewFile) setViewFile(null); else onClose(); }
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose, viewFile]);

  const handleDl = async (att) => {
    if (!att?.fileUrl) return;
    try {
      setDownloading(true);
      const res  = await fetch(att.fileUrl);
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = att.fileName || `notice.${att.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { window.open(att.fileUrl, '_blank'); }
    finally { setDownloading(false); }
  };

  /* inline image / cloudinary-pdf viewer */
  const InlineViewer = () => {
    const isImg = viewFile.fileType === 'image' || !viewFile.fileType?.includes('pdf');
    const isPDF = viewFile.fileType === 'pdf';
    return (
      <div className="nv-wrap">
        <div className="nv-bar">
          <button className="nv-bar-btn back" onClick={() => setViewFile(null)}>
            &#8592; Back
          </button>
          <span className="nv-bar-name">{viewFile.fileName || 'File'}</span>
          {isImg && (
            <>
              <button className="nv-bar-btn" onClick={() => setImgScale(s => Math.max(s - 0.25, 0.25))}>
                <ZoomOut size={16} />
              </button>
              <span className="nv-zoom-txt">{Math.round(imgScale * 100)}%</span>
              <button className="nv-bar-btn" onClick={() => setImgScale(s => Math.min(s + 0.25, 5))}>
                <ZoomIn size={16} />
              </button>
            </>
          )}
          <button
            className="nv-bar-btn dl"
            onClick={() => handleDl(viewFile)}
            disabled={downloading}
          >
            {downloading ? <Loader size={14} className="nv-spin" /> : <Download size={14} />}
            {downloading ? 'Downloading\u2026' : 'Download'}
          </button>
        </div>

        {isImg && (
          <div className="nv-img-stage">
            {!imgLoaded && <div className="nv-spinner"><Loader size={38} className="nv-spin" /></div>}
            <img
              src={viewFile.fileUrl}
              alt={viewFile.fileName || 'Image'}
              className="nv-img"
              style={{ transform: `scale(${imgScale})`, opacity: imgLoaded ? 1 : 0 }}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}

        {isPDF && (
          <div className="nv-pdf-stage">
            {!pdfErr ? (
              <iframe
                src={`${viewFile.fileUrl}#toolbar=1&navpanes=1`}
                title={viewFile.fileName}
                className="nv-pdf-iframe"
                onError={() => setPdfErr(true)}
              />
            ) : (
              <div className="nv-pdf-err">
                <FileText size={52} />
                <p>PDF preview unavailable</p>
                <button className="nv-dl-fallback" onClick={() => handleDl(viewFile)}>
                  <Download size={14} /> Download PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="nm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="nm-modal">

        {/* Header */}
        <div className="nm-hd" style={{ borderTop: `5px solid ${tc.color}` }}>
          <div className="nm-hd-top">
            <span className="nm-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
            {isNew7(notice.publishDate) && <span className="nm-new">NEW</span>}
            <button className="nm-x" onClick={onClose}><X size={18} /></button>
          </div>
          <h2 className="nm-title">{notice.title}</h2>
          <div className="nm-meta">
            <span><Calendar size={13} />{fmtDate(notice.publishDate)}</span>
            {notice.expiryDate && (
              <span className="nm-expiry"><Clock size={13} />Expires {fmtDate(notice.expiryDate)}</span>
            )}
          </div>
        </div>

        {/* Tabs — hidden when viewing a file */}
        {!viewFile && (hasDrive || hasFiles) && (
          <div className="nm-tabs">
            <button className={`nm-tab${tab === 'info'  ? ' on' : ''}`} onClick={() => setTab('info')}>
              &#128203; বিবরণ
            </button>
            {hasDrive && (
              <button className={`nm-tab${tab === 'drive' ? ' on' : ''}`} onClick={() => setTab('drive')}>
                &#128196; PDF ({notice.driveLinks.length})
              </button>
            )}
            {hasFiles && (
              <button className={`nm-tab${tab === 'files' ? ' on' : ''}`} onClick={() => setTab('files')}>
                &#128206; Files ({notice.attachments.length})
              </button>
            )}
          </div>
        )}

        <div className="nm-body">
          {viewFile ? <InlineViewer /> : (
            <>
              {/* TAB: বিবরণ */}
              {(tab === 'info' || (!hasDrive && !hasFiles)) && (
                <div className="nm-desc-tab">
                  <p className="nm-desc-txt">
                    {notice.description || 'কোনো বিবরণ দেওয়া হয়নি।'}
                  </p>
                  {hasFiles && (
                    <div className="nm-qdl-wrap">
                      <span className="nm-qdl-lbl">Attachments:</span>
                      {notice.attachments.map((att, i) => (
                        <button key={i} className="nm-qdl-btn" onClick={() => handleDl(att)} disabled={downloading}>
                          <Download size={13} />{att.fileName || `File ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Google Drive PDF */}
              {tab === 'drive' && hasDrive && (
                <div className="nm-drive-tab">
                  {notice.driveLinks.map((link, i) => (
                    <div key={i} className="nm-drive-block">
                      <div className="nm-drive-bar">
                        <FileText size={15} />
                        <span className="nm-drive-lbl">{link.label || `PDF Document ${i + 1}`}</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="nm-drive-ext">
                          <ExternalLink size={12} /> Drive&#2503; &#2454;&#2497;&#2482;&#2497;&#2472;
                        </a>
                      </div>
                      {/* full-width newspaper iframe */}
                      <iframe
                        src={toDriveEmbed(link.url)}
                        title={link.label || `PDF ${i + 1}`}
                        className="nm-drive-iframe"
                        allow="autoplay"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: Cloudinary files */}
              {tab === 'files' && hasFiles && (
                <div className="nm-files-tab">
                  {notice.attachments.map((att, i) => {
                    const isImg = att.fileType === 'image';
                    const isPDF = att.fileType === 'pdf';
                    return (
                      <div key={i} className="nm-file-row">
                        {isImg && (
                          <div className="nm-thumb" onClick={() => setViewFile(att)}>
                            <img src={att.fileUrl} alt={att.fileName || `img${i}`} />
                            <span className="nm-thumb-hover">View</span>
                          </div>
                        )}
                        {isPDF && (
                          <div className="nm-pdf-icon" onClick={() => setViewFile(att)}>
                            <FileText size={26} />
                          </div>
                        )}
                        <div className="nm-file-info">
                          <span className="nm-file-name" onClick={() => setViewFile(att)}>
                            {att.fileName || `File ${i + 1}`}
                          </span>
                          <span className="nm-file-type">{att.fileType?.toUpperCase()}</span>
                        </div>
                        <div className="nm-file-btns">
                          <button className="nm-btn-view" onClick={() => setViewFile(att)}>View</button>
                          <button className="nm-btn-dl" onClick={() => handleDl(att)} disabled={downloading}>
                            {downloading ? <Loader size={13} className="nv-spin" /> : <Download size={13} />}
                            Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="nm-footer">
          {viewFile ? (
            <button className="nm-ft-pill" onClick={() => setViewFile(null)}>&#8592; Notice-&#2503; &#2444;&#2495;&#2480;&#2497;&#2472;</button>
          ) : (
            <>
              {hasDrive && tab !== 'drive' && (
                <button className="nm-ft-pill drive" onClick={() => setTab('drive')}>
                  &#128196; {notice.driveLinks.length} PDF
                </button>
              )}
              {hasFiles && tab !== 'files' && (
                <button className="nm-ft-pill" onClick={() => setTab('files')}>
                  &#128206; {notice.attachments.length} File(s)
                </button>
              )}
            </>
          )}
          <button className="nm-ft-close" onClick={onClose}>&#2476;&#2472;&#2509;&#2471; &#2453;&#2480;&#2497;&#2472;</button>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   Main Notice Page
===================================================== */
const Notice = () => {
  const [loading,      setLoading]      = useState(true);
  const [notices,      setNotices]      = useState([]);
  const [activeNotice, setActiveNotice] = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pagination,   setPagination]   = useState({
    totalPages: 1, totalNotices: 0, hasNextPage: false, hasPrevPage: false,
  });
  const LIMIT = 8;

  const fetchNotices = useCallback(async (page) => {
    try {
      setLoading(true);
      const res = await noticeService.getPublicNotices(page, LIMIT);
      setNotices(res.data || []);
      setPagination(res.pagination || {});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotices(currentPage); }, [currentPage, fetchNotices]);

  const goPage = (p) => {
    if (p >= 1 && p <= pagination.totalPages) setCurrentPage(p);
  };

  const pageButtons = () => {
    const btns = [];
    const max  = 5;
    let start  = Math.max(1, currentPage - 2);
    let end    = Math.min(pagination.totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) {
      btns.push(
        <button key={i} className={`np-pg-btn${currentPage === i ? ' on' : ''}`} onClick={() => goPage(i)}>
          {i}
        </button>
      );
    }
    return btns;
  };

  if (loading) return (
    <div className="np-wrap">
      <div className="container">
        <SkeletonLoader type="title" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    </div>
  );

  return (
    <div className="np-wrap">
      <div className="container">

        {/* Page header */}
        <div className="np-page-hd">
          <div className="np-hd-icon"><Bell size={26} /></div>
          <div className="np-hd-text">
            <h1>Notice Board</h1>
            <div className="np-underline"></div>
          </div>
          {pagination.totalNotices > 0 && (
            <span className="np-total">{pagination.totalNotices} Notices</span>
          )}
        </div>

        {pagination.totalNotices > 0 && (
          <p className="np-range">
            Showing {(currentPage - 1) * LIMIT + 1}&ndash;{Math.min(currentPage * LIMIT, pagination.totalNotices)} of {pagination.totalNotices}
          </p>
        )}

        {/* List */}
        <div className="np-list">
          {notices.length === 0 ? (
            <div className="np-empty">
              <Bell size={60} color="#ccc" />
              <p>No notices available</p>
            </div>
          ) : notices.map((notice) => {
            const tc       = TYPE_CFG[notice.type] || TYPE_CFG.general;
            const hasDrive = notice.driveLinks?.length > 0;
            const hasFiles = notice.attachments?.length > 0;

            return (
              <div key={notice._id} className="np-item">
                {/* accent bar */}
                <div className="np-item-bar" style={{ background: tc.color }} />

                <div className="np-item-body">
                  <div className="np-item-top">
                    <div className="np-item-tags">
                      <span className="np-type-tag" style={{ background: tc.bg, color: tc.color }}>
                        {tc.label}
                      </span>
                      {isNew7(notice.publishDate) && <span className="np-new-tag">NEW</span>}
                    </div>
                    <span className="np-item-date">
                      <Calendar size={13} /> {fmtDate(notice.publishDate)}
                    </span>
                  </div>

                  {/* Title — click to open modal */}
                  <h4 className="np-item-title" onClick={() => setActiveNotice(notice)} title={notice.title}>
                    {wordLimit(notice.title, 10)}
                  </h4>

                  {/* Description preview */}
                  {notice.description && (
                    <p className="np-item-desc">
                      {notice.description.length > 130
                        ? notice.description.slice(0, 130) + '\u2026'
                        : notice.description}
                    </p>
                  )}

                  {/* File pills */}
                  {(hasDrive || hasFiles) && (
                    <div className="np-pills">
                      {hasDrive && (
                        <button className="np-pill drive" onClick={() => setActiveNotice(notice)}>
                          <FileText size={12} /> {notice.driveLinks.length} PDF
                        </button>
                      )}
                      {hasFiles && notice.attachments.map((att, i) => (
                        <button key={i} className={`np-pill ${att.fileType}`} onClick={() => setActiveNotice(notice)}>
                          {att.fileType === 'pdf' ? <FileText size={12} /> : <ImageIcon size={12} />}
                          {att.fileName
                            ? (att.fileName.length > 18 ? att.fileName.slice(0, 18) + '\u2026' : att.fileName)
                            : att.fileType?.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button className="np-view-btn" onClick={() => setActiveNotice(notice)}>
                  View &rarr;
                </button>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="np-pagination">
            <button className="np-nav" onClick={() => goPage(currentPage - 1)} disabled={!pagination.hasPrevPage}>
              <ChevronLeft size={18} /> Prev
            </button>
            <div className="np-pg-nums">
              {currentPage > 3 && (
                <>
                  <button className="np-pg-btn" onClick={() => goPage(1)}>1</button>
                  {currentPage > 4 && <span className="np-dots">&hellip;</span>}
                </>
              )}
              {pageButtons()}
              {currentPage < pagination.totalPages - 2 && (
                <>
                  {currentPage < pagination.totalPages - 3 && <span className="np-dots">&hellip;</span>}
                  <button className="np-pg-btn" onClick={() => goPage(pagination.totalPages)}>
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>
            <button className="np-nav" onClick={() => goPage(currentPage + 1)} disabled={!pagination.hasNextPage}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>

      {activeNotice && (
        <NoticeModal notice={activeNotice} onClose={() => setActiveNotice(null)} />
      )}
    </div>
  );
};

export default Notice;