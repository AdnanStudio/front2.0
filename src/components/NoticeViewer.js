// ============================================================
// FILE PATH: src/components/NoticeViewer.js
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  X, Download, FileText, Image as ImageIcon,
  ZoomIn, ZoomOut, Loader, ExternalLink,
  Calendar, Clock, ChevronLeft, ChevronRight,
  Bell
} from 'lucide-react';
import './NoticeViewer.css';

const TYPE_CONFIG = {
  general:   { label: 'General',   bg: '#e3f2fd', color: '#1565c0' },
  urgent:    { label: 'Urgent',    bg: '#ffebee', color: '#c62828' },
  exam:      { label: 'Exam',      bg: '#fff3e0', color: '#e65100' },
  holiday:   { label: 'Holiday',   bg: '#f3e5f5', color: '#7b1fa2' },
  event:     { label: 'Event',     bg: '#e8f5e9', color: '#2e7d32' },
  admission: { label: 'Admission', bg: '#fce4ec', color: '#c2185b' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

const isGoogleDriveLink = (url) =>
  url && (url.includes('drive.google.com') || url.includes('docs.google.com'));

const getDriveEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  const viewMatch = url.match(/[?&]id=([^&]+)/);
  if (viewMatch) return `https://drive.google.com/file/d/${viewMatch[1]}/preview`;
  return url;
};

// Props:
//   notice      – the full notice object (title, description, type, publishDate, expiryDate, attachments[])
//   attachment  – currently selected attachment (or null = show notice detail)
//   onClose     – close the viewer
//   onSelectAttachment – switch attachment
const NoticeViewer = ({ notice, attachment, onClose, onSelectAttachment }) => {
  const [scale, setScale]         = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [pdfError, setPdfError]   = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Reset state when attachment changes
  useEffect(() => {
    setScale(1);
    setImgLoaded(false);
    setPdfError(false);
  }, [attachment]);

  // Keyboard ESC to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tc = TYPE_CONFIG[notice?.type] || TYPE_CONFIG.general;
  const attachments = notice?.attachments || [];
  const currentIdx  = attachment ? attachments.findIndex(a => a.fileUrl === attachment.fileUrl) : -1;
  const isPDF       = attachment?.fileType === 'pdf';
  const isDrive     = isGoogleDriveLink(attachment?.fileUrl);

  const handleDownload = async () => {
    if (!attachment?.fileUrl) return;
    if (isDrive) {
      window.open(attachment.fileUrl, '_blank');
      return;
    }
    try {
      setDownloading(true);
      const res  = await fetch(attachment.fileUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = attachment.fileName || `notice-${Date.now()}.${isPDF ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      const a    = document.createElement('a');
      a.href     = attachment.fileUrl;
      a.download = attachment.fileName || 'download';
      a.target   = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* ────────────────────────────────
     RENDER: Notice Detail (no attachment selected)
  ──────────────────────────────── */
  const renderNoticeDetail = () => (
    <div className="nv-detail-body">
      {/* Type + dates */}
      <div className="nv-detail-meta">
        <span className="nv-detail-type" style={{ background: tc.bg, color: tc.color }}>
          {tc.label}
        </span>
        <div className="nv-detail-dates">
          <span><Calendar size={14} /> Published: {fmtDate(notice.publishDate)}</span>
          {notice.expiryDate && (
            <span className="nv-expiry"><Clock size={14} /> Expires: {fmtDate(notice.expiryDate)}</span>
          )}
        </div>
      </div>

      {/* Description */}
      {notice.description && (
        <div className="nv-detail-desc">
          <p>{notice.description}</p>
        </div>
      )}

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="nv-detail-attachments">
          <h4>Attachments ({attachments.length})</h4>
          <div className="nv-att-list">
            {attachments.map((att, i) => {
              const drive  = isGoogleDriveLink(att.fileUrl);
              const pdf    = att.fileType === 'pdf';
              return (
                <button
                  key={i}
                  className={`nv-att-item ${drive ? 'drive' : pdf ? 'pdf' : 'img'}`}
                  onClick={() => onSelectAttachment(att)}
                >
                  <div className="nv-att-icon">
                    {drive ? <ExternalLink size={20} /> : pdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <div className="nv-att-info">
                    <span className="nv-att-name">
                      {att.fileName || (drive ? 'Google Drive File' : pdf ? 'PDF Document' : 'Image File')}
                    </span>
                    <span className="nv-att-type">
                      {drive ? 'Google Drive' : pdf ? 'PDF' : 'Image'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="nv-att-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ────────────────────────────────
     RENDER: File Viewer
  ──────────────────────────────── */
  const renderFileViewer = () => {
    if (isDrive) {
      const embedUrl = getDriveEmbedUrl(attachment.fileUrl);
      return (
        <div className="nv-file-viewer">
          <iframe
            src={embedUrl}
            title={attachment.fileName || 'Google Drive File'}
            className="nv-drive-iframe"
            allow="autoplay"
          />
        </div>
      );
    }
    if (isPDF) {
      return (
        <div className="nv-file-viewer">
          {!pdfError ? (
            <iframe
              src={`${attachment.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              title={attachment.fileName}
              className="nv-pdf-iframe"
              onError={() => setPdfError(true)}
            />
          ) : (
            <div className="nv-pdf-error">
              <FileText size={56} />
              <p>Cannot preview PDF in browser</p>
              <button className="nv-download-alt" onClick={handleDownload} disabled={downloading}>
                {downloading ? <><Loader size={16} className="nv-spin" /> Downloading…</> : <><Download size={16} /> Download PDF</>}
              </button>
            </div>
          )}
        </div>
      );
    }
    // Image
    return (
      <div className="nv-file-viewer nv-img-viewer">
        {!imgLoaded && (
          <div className="nv-img-loading"><Loader size={32} className="nv-spin" /></div>
        )}
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName || 'Notice image'}
          style={{ transform: `scale(${scale})`, opacity: imgLoaded ? 1 : 0 }}
          className="nv-viewer-img"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
    );
  };

  return (
    <div className="nv-overlay" onClick={handleBackdrop}>
      <div className="nv-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="nv-header">
          <div className="nv-header-left">
            <div className="nv-header-icon" style={{ background: tc.bg, color: tc.color }}>
              <Bell size={18} />
            </div>
            <div className="nv-header-text">
              <h2 className="nv-title">{notice?.title}</h2>
              {attachment && (
                <span className="nv-breadcrumb">
                  <button onClick={() => onSelectAttachment(null)}>Notice</button>
                  &nbsp;›&nbsp;
                  <span>{attachment.fileName || (isDrive ? 'Google Drive' : isPDF ? 'PDF' : 'Image')}</span>
                </span>
              )}
            </div>
          </div>

          <div className="nv-header-actions">
            {/* Zoom controls for image */}
            {attachment && !isPDF && !isDrive && (
              <>
                <button className="nv-btn" onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} title="Zoom Out">
                  <ZoomOut size={18} />
                </button>
                <span className="nv-zoom-lbl">{Math.round(scale * 100)}%</span>
                <button className="nv-btn" onClick={() => setScale(s => Math.min(s + 0.25, 4))} title="Zoom In">
                  <ZoomIn size={18} />
                </button>
              </>
            )}

            {/* Prev / Next attachment */}
            {attachment && attachments.length > 1 && (
              <>
                <button
                  className="nv-btn"
                  disabled={currentIdx <= 0}
                  onClick={() => onSelectAttachment(attachments[currentIdx - 1])}
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="nv-att-counter">{currentIdx + 1} / {attachments.length}</span>
                <button
                  className="nv-btn"
                  disabled={currentIdx >= attachments.length - 1}
                  onClick={() => onSelectAttachment(attachments[currentIdx + 1])}
                  title="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Download */}
            {attachment && (
              <button className="nv-btn nv-dl-btn" onClick={handleDownload} disabled={downloading}>
                {downloading
                  ? <><Loader size={16} className="nv-spin" /> Downloading…</>
                  : <><Download size={16} /> {isDrive ? 'Open' : 'Download'}</>
                }
              </button>
            )}

            {/* Close */}
            <button className="nv-btn nv-close-btn" onClick={onClose} title="Close">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="nv-body">
          {attachment ? renderFileViewer() : renderNoticeDetail()}
        </div>

        {/* ── Footer ── */}
        {attachment && (
          <div className="nv-footer">
            <span className="nv-file-badge">
              {isDrive ? '🔗 Google Drive' : isPDF ? '📄 PDF Document' : '🖼 Image File'}
            </span>
            <span className="nv-footer-hint">
              {isDrive
                ? 'Viewing from Google Drive'
                : isPDF
                ? 'Scroll to read • Use browser controls for zoom'
                : 'Use zoom buttons to resize image'}
            </span>
            {/* Back to notice button */}
            <button className="nv-back-notice" onClick={() => onSelectAttachment(null)}>
              ← Back to Notice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeViewer;
