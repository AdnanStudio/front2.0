import React, { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, ZoomIn, ZoomOut, Loader } from 'lucide-react';
import './NoticeViewer.css';

const NoticeViewer = ({ attachment, onClose }) => {
  const [scale, setScale] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Fetch the file from Cloudinary
      const response = await fetch(attachment.fileUrl);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set proper filename with extension
      const fileExtension = attachment.fileType === 'pdf' ? 'pdf' : 'jpg';
      const fileName = attachment.fileName || `notice-${Date.now()}.${fileExtension}`;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloading(false);
      console.log('✅ File downloaded successfully:', fileName);
    } catch (error) {
      console.error('❌ Download failed:', error);
      setDownloading(false);
      
      // Fallback: Try direct link download
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('notice-viewer-overlay')) {
      onClose();
    }
  };

  const isPDF = attachment.fileType === 'pdf';

  return (
    <div className="notice-viewer-overlay" onClick={handleBackdropClick}>
      <div className="notice-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notice-viewer-header">
          <div className="viewer-title">
            {isPDF ? <FileText size={20} /> : <ImageIcon size={20} />}
            <span>{attachment.fileName || 'Attachment'}</span>
          </div>
          
          <div className="viewer-actions">
            {!isPDF && (
              <>
                <button onClick={handleZoomOut} className="viewer-btn" title="Zoom Out">
                  <ZoomOut size={20} />
                </button>
                <span className="zoom-level">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} className="viewer-btn" title="Zoom In">
                  <ZoomIn size={20} />
                </button>
              </>
            )}
            
            <button 
              onClick={handleDownload} 
              className="viewer-btn download-btn" 
              title="Download"
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader size={18} className="spinner" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download</span>
                </>
              )}
            </button>
            
            <button onClick={onClose} className="viewer-btn close-btn" title="Close">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="notice-viewer-content">
          {isPDF ? (
            <div className="pdf-viewer-wrapper">
              {!pdfError ? (
                <iframe
                  src={`${attachment.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  title={attachment.fileName}
                  className="pdf-iframe"
                  onError={() => setPdfError(true)}
                />
              ) : (
                <div className="pdf-error">
                  <FileText size={60} />
                  <p>Unable to display PDF in browser</p>
                  <button onClick={handleDownload} className="btn-download-alt" disabled={downloading}>
                    {downloading ? (
                      <>
                        <Loader size={18} className="spinner" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="image-viewer-wrapper">
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                style={{ transform: `scale(${scale})` }}
                className="viewer-image"
              />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="notice-viewer-footer">
          <span className="file-type-badge">
            {isPDF ? 'PDF Document' : 'Image File'}
          </span>
          <span className="file-size-info">
            {isPDF ? 'Scroll to navigate • Use browser controls to zoom' : 'Click and drag to pan • Use buttons to zoom'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoticeViewer;