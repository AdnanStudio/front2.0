import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import noticeService from '../services/noticeService';
import NoticeViewer from '../components/NoticeViewer';
import { FileText, Download, Calendar, Bell, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './ContentPages.css';

const Notice = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalNotices: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchNotices(currentPage);
  }, [currentPage]);

  const fetchNotices = async (page) => {
    try {
      setLoading(true);
      const response = await noticeService.getPublicNotices(page, 8);
      
      console.log('📋 Notices Response:', response);
      
      setNotices(response.data || []);
      setPagination(response.pagination || {});
      setLoading(false);
      
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('❌ Failed to fetch notices:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAttachmentClick = (attachment) => {
    setSelectedAttachment(attachment);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="content-page-wrapper">
        <div className="container">
          <SkeletonLoader type="title" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="content-page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Notice Board</h1>
          <div className="title-underline"></div>
          {pagination.totalNotices > 0 && (
            <p className="notice-count">
              Showing {((currentPage - 1) * 8) + 1} - {Math.min(currentPage * 8, pagination.totalNotices)} of {pagination.totalNotices} notices
            </p>
          )}
        </div>

        <div className="notice-full-list">
          {notices.length === 0 ? (
            <div className="no-notices">
              <Bell size={60} color="#ccc" />
              <p>No notices available at the moment</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div key={notice._id} className="notice-item-full">
                <div className="notice-item-header">
                  <div className="notice-item-left">
                    <span className={`notice-badge ${notice.type}`}>
                      {notice.type}
                    </span>
                    <div className="notice-date-public">
                      <Calendar size={16} />
                      <span>{formatDate(notice.publishDate)}</span>
                    </div>
                  </div>
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="notice-attachment-indicator">
                      📎 {notice.attachments.length}
                    </div>
                  )}
                </div>

                <h4>{notice.title}</h4>

                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="notice-files-grid">
                    {notice.attachments.map((attachment, index) => (
                      <button
                        key={index}
                        className="file-preview-btn"
                        onClick={() => handleAttachmentClick(attachment)}
                      >
                        {attachment.fileType === 'pdf' ? (
                          <>
                            <FileText size={18} />
                            <span>PDF Document</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={18} />
                            <span>Image File</span>
                          </>
                        )}
                        <Download size={14} className="download-icon" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-nav-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="pagination-numbers">
              {currentPage > 3 && (
                <>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="pagination-dots">...</span>}
                </>
              )}

              {renderPaginationButtons()}

              {currentPage < pagination.totalPages - 2 && (
                <>
                  {currentPage < pagination.totalPages - 3 && (
                    <span className="pagination-dots">...</span>
                  )}
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              className="pagination-nav-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {selectedAttachment && (
          <NoticeViewer
            attachment={selectedAttachment}
            onClose={() => setSelectedAttachment(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Notice;



// import React, { useState, useEffect } from 'react';
// import SkeletonLoader from '../components/SkeletonLoader';
// import noticeService from '../services/noticeService';
// import NoticeViewer from '../components/NoticeViewer';
// import { FileText, Download, Calendar, Bell, Image as ImageIcon } from 'lucide-react';
// import './ContentPages.css';

// const Notice = () => {
//   const [loading, setLoading] = useState(true);
//   const [notices, setNotices] = useState([]);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);

//   useEffect(() => {
//     fetchNotices();
//   }, []);

//   const fetchNotices = async () => {
//     try {
//       const response = await noticeService.getPublicNotices();
//       setNotices(response.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Failed to fetch notices:', error);
//       setLoading(false);
//     }
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-GB', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const handleAttachmentClick = (attachment) => {
//     setSelectedAttachment(attachment);
//   };

//   if (loading) {
//     return (
//       <div className="content-page-wrapper">
//         <div className="container">
//           <SkeletonLoader type="title" />
//           <SkeletonLoader type="card" />
//           <SkeletonLoader type="card" />
//           <SkeletonLoader type="card" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="content-page-wrapper">
//       <div className="container">
//         <div className="page-header">
//           <h1>Notice Board</h1>
//           <div className="title-underline"></div>
//         </div>

//         <div className="notice-full-list">
//           {notices.length === 0 ? (
//             <div className="no-notices">
//               <Bell size={60} color="#ccc" />
//               <p>No notices available</p>
//             </div>
//           ) : (
//             notices.map((notice) => (
//               <div key={notice._id} className="notice-item-full">
//                 <div className="notice-item-header">
//                   <div className="notice-item-left">
//                     <span className={`notice-badge ${notice.type}`}>
//                       {notice.type}
//                     </span>
//                     <div className="notice-date-public">
//                       <Calendar size={16} />
//                       <span>{formatDate(notice.publishDate)}</span>
//                     </div>
//                   </div>
//                   {notice.attachments && notice.attachments.length > 0 && (
//                     <div className="notice-attachment-indicator">
//                       📎 {notice.attachments.length}
//                     </div>
//                   )}
//                 </div>

//                 <h4>{notice.title}</h4>
//                 <p className="notice-description">{notice.description}</p>

//                 {notice.attachments && notice.attachments.length > 0 && (
//                   <div className="notice-files-grid">
//                     {notice.attachments.map((attachment, index) => (
//                       <button
//                         key={index}
//                         className="file-preview-btn"
//                         onClick={() => handleAttachmentClick(attachment)}
//                       >
//                         {attachment.fileType === 'pdf' ? (
//                           <>
//                             <FileText size={18} />
//                             <span>PDF Document</span>
//                           </>
//                         ) : (
//                           <>
//                             <ImageIcon size={18} />
//                             <span>Image File</span>
//                           </>
//                         )}
//                         <Download size={14} className="download-icon" />
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {selectedAttachment && (
//           <NoticeViewer
//             attachment={selectedAttachment}
//             onClose={() => setSelectedAttachment(null)}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Notice;