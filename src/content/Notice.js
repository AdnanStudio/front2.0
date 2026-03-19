// // FILE PATH: src/content/Notice.js
// // ✅ Notice list: title + description preview + file pills
// // ✅ Modal tabs:
// //    বিবরণ  → full title + description
// //    PDF     → Google Drive iframe + Download button
// //    ফাইল    → Cloudinary images/PDFs — view + Download button
// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   FileText, Download, Calendar, Bell, Image as ImageIcon,
//   ChevronLeft, ChevronRight, X, ExternalLink, Clock,
//   ZoomIn, ZoomOut, Loader, Search, Filter, Globe,
// } from 'lucide-react';
// import SkeletonLoader from '../components/SkeletonLoader';
// import noticeService from '../services/noticeService';
// import './Notice.css';

// /* ── Helpers ── */
// const fmtDate = d => new Date(d).toLocaleDateString('bn-BD', { day:'numeric', month:'short', year:'numeric' });
// const isNew7  = d => (Date.now() - new Date(d)) < 7 * 86400000;
// const toDriveEmbed = (url = '') => {
//   if (!url) return '';
//   if (url.includes('/preview')) return url;
//   const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
//   if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
//   const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
//   if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
//   return url;
// };

// const TYPE_CFG = {
//   general:   { bg:'#e3f2fd', color:'#1565c0', label:'সাধারণ'   },
//   urgent:    { bg:'#ffebee', color:'#c62828', label:'জরুরি'    },
//   exam:      { bg:'#fff3e0', color:'#e65100', label:'পরীক্ষা'  },
//   holiday:   { bg:'#f3e5f5', color:'#7b1fa2', label:'ছুটি'     },
//   event:     { bg:'#e8f5e9', color:'#2e7d32', label:'ইভেন্ট'   },
//   admission: { bg:'#fce4ec', color:'#c2185b', label:'ভর্তি'    },
// };
// const LIMIT = 15;

// /* ══════════════════ FILE VIEWER ══════════════════════════ */
// function FileViewer({ file, onClose }) {
//   const [scale,  setScale]  = useState(1);
//   const [loaded, setLoaded] = useState(false);
//   const [pdfErr, setPdfErr] = useState(false);
//   const [dlLoad, setDlLoad] = useState(false);
//   const isImg = file.fileType === 'image' || !file.fileType?.includes('pdf');
//   const isPdf = file.fileType === 'pdf';

//   useEffect(() => {
//     const h = e => { if (e.key === 'Escape') onClose(); };
//     window.addEventListener('keydown', h);
//     document.body.style.overflow = 'hidden';
//     return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
//   }, [onClose]);

//   const dl = async () => {
//     if (!file.fileUrl) return;
//     setDlLoad(true);
//     try {
//       const res  = await fetch(file.fileUrl);
//       const blob = await res.blob();
//       const url  = URL.createObjectURL(blob);
//       const a    = document.createElement('a');
//       a.href = url; a.download = file.fileName || 'notice-file';
//       document.body.appendChild(a); a.click();
//       document.body.removeChild(a); URL.revokeObjectURL(url);
//     } catch { window.open(file.fileUrl, '_blank'); }
//     finally { setDlLoad(false); }
//   };

//   return (
//     <div className="fv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className="fv-box">
//         <div className="fv-bar">
//           <button className="fv-bar-btn back" onClick={onClose}>← ফিরুন</button>
//           <span className="fv-bar-name">{file.fileName || 'ফাইল'}</span>
//           {isImg && (
//             <>
//               <button className="fv-bar-btn" onClick={() => setScale(s => Math.max(s-.25,.25))}><ZoomOut size={14}/></button>
//               <span className="fv-zoom">{Math.round(scale*100)}%</span>
//               <button className="fv-bar-btn" onClick={() => setScale(s => Math.min(s+.25,5))}><ZoomIn size={14}/></button>
//             </>
//           )}
//           <button className="fv-bar-btn dl-btn" onClick={dl} disabled={dlLoad}>
//             {dlLoad ? <Loader size={13} className="fv-spin"/> : <Download size={13}/>}
//             {dlLoad ? 'ডাউনলোড...' : 'ডাউনলোড'}
//           </button>
//           <button className="fv-bar-btn close-btn" onClick={onClose}><X size={15}/></button>
//         </div>
//         <div className="fv-stage">
//           {isImg && (
//             <>
//               {!loaded && <div className="fv-spin-wrap"><Loader size={38} className="fv-spin"/></div>}
//               <img src={file.fileUrl} alt={file.fileName || 'image'} className="fv-img"
//                 style={{ transform:`scale(${scale})`, opacity: loaded ? 1 : 0 }}
//                 onLoad={() => setLoaded(true)} />
//             </>
//           )}
//           {isPdf && !pdfErr && (
//             <iframe src={`${file.fileUrl}#toolbar=1`} title={file.fileName}
//               className="fv-iframe" onError={() => setPdfErr(true)} allowFullScreen/>
//           )}
//           {isPdf && pdfErr && (
//             <div className="fv-err">
//               <FileText size={48}/>
//               <p>PDF দেখা যাচ্ছে না</p>
//               <button className="fv-dl-btn2" onClick={dl}><Download size={13}/> ডাউনলোড করুন</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════ NOTICE MODAL ════════════════════════ */
// function NoticeModal({ notice, onClose }) {
//   const hasDrive = notice.driveLinks?.length > 0;
//   const hasFiles = notice.attachments?.length > 0;
//   const [tab,      setTab]      = useState('info');
//   const [viewFile, setViewFile] = useState(null);
//   const [dlLoad,   setDlLoad]   = useState(false);
//   const tc = TYPE_CFG[notice.type] || TYPE_CFG.general;

//   useEffect(() => {
//     const h = e => { if (e.key === 'Escape') { if (viewFile) setViewFile(null); else onClose(); } };
//     window.addEventListener('keydown', h);
//     document.body.style.overflow = 'hidden';
//     return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
//   }, [onClose, viewFile]);

//   /* Download Cloudinary file */
//   const downloadFile = async (att) => {
//     if (!att?.fileUrl) return;
//     setDlLoad(true);
//     try {
//       const res  = await fetch(att.fileUrl);
//       const blob = await res.blob();
//       const url  = URL.createObjectURL(blob);
//       const a    = document.createElement('a');
//       a.href = url;
//       a.download = att.fileName || `notice.${att.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
//       document.body.appendChild(a); a.click();
//       document.body.removeChild(a); URL.revokeObjectURL(url);
//     } catch { window.open(att.fileUrl, '_blank'); }
//     finally { setDlLoad(false); }
//   };

//   if (viewFile) return <FileViewer file={viewFile} onClose={() => setViewFile(null)}/>;

//   return (
//     <div className="nm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className="nm-modal">

//         {/* Header */}
//         <div className="nm-hd" style={{ borderTop:`5px solid ${tc.color}` }}>
//           <div className="nm-hd-row">
//             <span className="nm-badge" style={{ background:tc.bg, color:tc.color }}>{tc.label}</span>
//             {isNew7(notice.publishDate) && <span className="nm-new">নতুন</span>}
//             <div className="nm-meta-row">
//               <span className="nm-date-span"><Calendar size={12}/>{fmtDate(notice.publishDate)}</span>
//               {notice.expiryDate && <span className="nm-expiry"><Clock size={12}/>মেয়াদ: {fmtDate(notice.expiryDate)}</span>}
//             </div>
//             <button className="nm-x" onClick={onClose}><X size={18}/></button>
//           </div>
//           <h2 className="nm-title">{notice.title}</h2>
//         </div>

//         {/* Tabs */}
//         {(hasDrive || hasFiles) && (
//           <div className="nm-tabs">
//             <button className={`nm-tab${tab==='info'?' active':''}`} onClick={() => setTab('info')}>📋 বিবরণ</button>
//             {hasDrive && (
//               <button className={`nm-tab${tab==='drive'?' active':''}`} onClick={() => setTab('drive')}>
//                 🌐 PDF দেখুন <span className="nm-tc">{notice.driveLinks.length}</span>
//               </button>
//             )}
//             {hasFiles && (
//               <button className={`nm-tab${tab==='files'?' active':''}`} onClick={() => setTab('files')}>
//                 📎 ফাইল <span className="nm-tc">{notice.attachments.length}</span>
//               </button>
//             )}
//           </div>
//         )}

//         <div className="nm-body">

//           {/* INFO TAB */}
//           {tab === 'info' && (
//             <div className="nm-info-wrap">
//               <div className="nm-info-block">
//                 <p className="nm-lbl">📌 শিরোনাম</p>
//                 <h3 className="nm-info-title">{notice.title}</h3>
//               </div>
//               {notice.description ? (
//                 <div className="nm-info-block">
//                   <p className="nm-lbl">📝 বিবরণ</p>
//                   <div className="nm-desc-text">{notice.description}</div>
//                 </div>
//               ) : (
//                 <div className="nm-empty-desc"><Bell size={26} color="#ccc"/><p>বিবরণ যোগ করা হয়নি।</p></div>
//               )}
//               {(hasDrive || hasFiles) && (
//                 <div className="nm-shortcuts">
//                   <p className="nm-lbl">📎 সংযুক্ত ফাইল</p>
//                   <div className="nm-shortcut-pills">
//                     {hasDrive && <button className="nm-sc-pill drive" onClick={() => setTab('drive')}><Globe size={13}/> PDF দেখুন</button>}
//                     {hasFiles && <button className="nm-sc-pill files" onClick={() => setTab('files')}><ImageIcon size={13}/> ফাইলসমূহ</button>}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* DRIVE TAB */}
//           {tab === 'drive' && (
//             <div className="nm-drive-wrap">
//               {notice.driveLinks?.map((lnk, i) => (
//                 <div key={i} className="nm-drive-item">
//                   <div className="nm-drive-hd">
//                     <Globe size={16} color="#7c3aed"/>
//                     <span className="nm-drive-nm">{lnk.label || lnk.title || `PDF ${i+1}`}</span>
//                     <div className="nm-drive-action-btns">
//                       {/* Download from Drive — opens in new tab (Drive handles download) */}
//                       <a
//                         href={`${(lnk.url||lnk).replace('/view','/').replace('/preview','/').split('?')[0]}?export=download`}
//                         target="_blank" rel="noopener noreferrer"
//                         className="nm-drive-btn dl"
//                         title="PDF ডাউনলোড করুন"
//                       >
//                         <Download size={13}/> ডাউনলোড
//                       </a>
//                       <a href={lnk.url||lnk} target="_blank" rel="noopener noreferrer"
//                         className="nm-drive-btn open">
//                         <ExternalLink size={13}/> নতুন ট্যাবে
//                       </a>
//                     </div>
//                   </div>
//                   <div className="nm-drive-frame">
//                     <iframe src={toDriveEmbed(lnk.url||lnk)} title={`PDF ${i+1}`}
//                       className="nm-drive-iframe" allowFullScreen/>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* FILES TAB */}
//           {tab === 'files' && (
//             <div className="nm-files-grid">
//               {notice.attachments?.map((att, i) => {
//                 const isImg = att.fileType === 'image' || !att.fileType?.includes('pdf');
//                 const isPdf = att.fileType === 'pdf';
//                 return (
//                   <div key={i} className="nm-file-card">
//                     {isImg && att.fileUrl && (
//                       <div className="nm-fc-thumb" onClick={() => setViewFile(att)}>
//                         <img src={att.fileUrl} alt={att.fileName || 'ছবি'}/>
//                         <div className="nm-fc-ov"><ZoomIn size={20}/></div>
//                       </div>
//                     )}
//                     {isPdf && (
//                       <div className="nm-fc-pdf" onClick={() => setViewFile(att)}>
//                         <FileText size={38} color="#ef4444"/>
//                         <span>PDF ফাইল</span>
//                       </div>
//                     )}
//                     <div className="nm-fc-info">
//                       <p className="nm-fc-name">{att.fileName || (isImg?'ছবি':'PDF')}</p>
//                       <div className="nm-fc-btns">
//                         {isImg && (
//                           <button className="nm-fc-btn view" onClick={() => setViewFile(att)}>
//                             <ExternalLink size={12}/> দেখুন
//                           </button>
//                         )}
//                         {isPdf && (
//                           <button className="nm-fc-btn view" onClick={() => setViewFile(att)}>
//                             <ExternalLink size={12}/> দেখুন
//                           </button>
//                         )}
//                         {att.fileUrl && (
//                           <button className="nm-fc-btn dl" onClick={() => downloadFile(att)} disabled={dlLoad}>
//                             {dlLoad ? <Loader size={11} className="fv-spin"/> : <Download size={12}/>}
//                             ডাউনলোড
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════ MAIN NOTICE PAGE ════════════════════ */
// const Notice = () => {
//   const { id }   = useParams();
//   const navigate  = useNavigate();
//   const [notices,      setNotices]      = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [activeNotice, setActiveNotice] = useState(null);
//   const [currentPage,  setCurrentPage]  = useState(1);
//   const [pagination,   setPagination]   = useState({ totalPages:1, totalNotices:0 });
//   const [search,       setSearch]       = useState('');
//   const [filterType,   setFilterType]   = useState('');

//   const fetchNotices = useCallback(async (page=1) => {
//     try {
//       setLoading(true);
//       const res = await noticeService.getPublicNotices(page, LIMIT);
//       const data = res.data || [];
//       setNotices(data);
//       setPagination({
//         totalPages:   res.totalPages   || 1,
//         totalNotices: res.totalNotices || data.length,
//         hasPrevPage:  page > 1,
//         hasNextPage:  page < (res.totalPages||1),
//       });
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => { fetchNotices(currentPage); }, [currentPage, fetchNotices]);

//   useEffect(() => {
//     if (!id || notices.length === 0) return;
//     const found = notices.find(n => n._id === id);
//     if (found) setActiveNotice(found);
//   }, [id, notices]);

//   const openNotice  = n => { setActiveNotice(n); navigate(`/notices/${n._id}`, { replace:true }); };
//   const closeNotice = () => { setActiveNotice(null); navigate('/notices', { replace:true }); };
//   const goPage = p => {
//     if (p < 1 || p > pagination.totalPages) return;
//     setCurrentPage(p);
//     window.scrollTo({ top:0, behavior:'smooth' });
//   };

//   const filtered = notices.filter(n => {
//     const ms = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.description?.toLowerCase().includes(search.toLowerCase());
//     const mt = !filterType || n.type === filterType;
//     return ms && mt;
//   });

//   const pageButtons = () => {
//     const btns = [];
//     const s = Math.max(1, currentPage-2);
//     const e = Math.min(pagination.totalPages, currentPage+2);
//     for (let p=s; p<=e; p++) {
//       btns.push(<button key={p} className={`np-pg-btn${p===currentPage?' current':''}`} onClick={() => goPage(p)}>{p}</button>);
//     }
//     return btns;
//   };

//   return (
//     <div className="np-root">
//       <div className="np-container">
//         {/* Header */}
//         <div className="np-hd">
//           <div className="np-hd-left">
//             <div className="np-bell-wrap"><Bell size={22}/></div>
//             <div>
//               <h1>নোটিশ বোর্ড</h1>
//               <p className="np-hd-sub">Notice Board — মালখানগর কলেজ</p>
//             </div>
//           </div>
//           {pagination.totalNotices > 0 && <span className="np-total">{pagination.totalNotices} টি নোটিশ</span>}
//         </div>

//         {/* Filters */}
//         <div className="np-filters">
//           <div className="np-search">
//             <Search size={14}/>
//             <input type="text" placeholder="নোটিশ খুঁজুন..." value={search}
//               onChange={e => setSearch(e.target.value)} className="np-search-inp"/>
//           </div>
//           <div className="np-type-filter">
//             <Filter size={13}/>
//             <select value={filterType} onChange={e => setFilterType(e.target.value)} className="np-type-sel">
//               <option value="">সব ধরন</option>
//               {Object.entries(TYPE_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
//             </select>
//           </div>
//         </div>

//         {!loading && pagination.totalNotices > 0 && (
//           <p className="np-range">
//             দেখানো হচ্ছে {(currentPage-1)*LIMIT+1}–{Math.min(currentPage*LIMIT, pagination.totalNotices)} / মোট {pagination.totalNotices}
//           </p>
//         )}

//         {/* List */}
//         {loading ? (
//           <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:16 }}>
//             {[1,2,3,4,5].map(i => <SkeletonLoader key={i} type="card"/>)}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="np-empty"><Bell size={60} color="#ccc"/><p>কোনো নোটিশ পাওয়া যায়নি</p></div>
//         ) : (
//           <div className="np-list">
//             {filtered.map(n => {
//               const tc = TYPE_CFG[n.type] || TYPE_CFG.general;
//               const hd = n.driveLinks?.length > 0;
//               const hf = n.attachments?.length > 0;
//               return (
//                 <div key={n._id} className="np-item">
//                   <div className="np-item-accent" style={{ background:tc.color }}/>
//                   <div className="np-item-body">
//                     <div className="np-item-top">
//                       <div className="np-tags">
//                         <span className="np-type-tag" style={{ background:tc.bg, color:tc.color }}>{tc.label}</span>
//                         {isNew7(n.publishDate) && <span className="np-new-tag">নতুন</span>}
//                       </div>
//                       <span className="np-date"><Calendar size={12}/>{fmtDate(n.publishDate)}</span>
//                     </div>
//                     <h4 className="np-title" onClick={() => openNotice(n)}>{n.title}</h4>
//                     {n.description && (
//                       <p className="np-desc-preview">
//                         {n.description.length > 150 ? n.description.slice(0,150)+'…' : n.description}
//                       </p>
//                     )}
//                     {(hd || hf) && (
//                       <div className="np-pills">
//                         {hd && (
//                           <button className="np-pill drive" onClick={() => openNotice(n)}>
//                             <Globe size={11}/> {n.driveLinks.length} PDF
//                           </button>
//                         )}
//                         {hf && n.attachments.map((att,i) => (
//                           <button key={i} className={`np-pill ${att.fileType}`} onClick={() => openNotice(n)}>
//                             {att.fileType==='pdf' ? <FileText size={11}/> : <ImageIcon size={11}/>}
//                             {att.fileName ? att.fileName.slice(0,18)+(att.fileName.length>18?'…':'') : att.fileType?.toUpperCase()}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <button className="np-view-btn" onClick={() => openNotice(n)}>দেখুন →</button>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="np-pagination">
//             <button className="np-nav" onClick={() => goPage(currentPage-1)} disabled={!pagination.hasPrevPage}>
//               <ChevronLeft size={15}/> আগের
//             </button>
//             <div className="np-pg-nums">
//               {currentPage > 3 && (<><button className="np-pg-btn" onClick={() => goPage(1)}>1</button>{currentPage > 4 && <span className="np-dots">…</span>}</>)}
//               {pageButtons()}
//               {currentPage < pagination.totalPages-2 && (<>{currentPage < pagination.totalPages-3 && <span className="np-dots">…</span>}<button className="np-pg-btn" onClick={() => goPage(pagination.totalPages)}>{pagination.totalPages}</button></>)}
//             </div>
//             <button className="np-nav" onClick={() => goPage(currentPage+1)} disabled={!pagination.hasNextPage}>
//               পরের <ChevronRight size={15}/>
//             </button>
//           </div>
//         )}
//       </div>

//       {activeNotice && <NoticeModal notice={activeNotice} onClose={closeNotice}/>}
//     </div>
//   );
// };

// export default Notice;

// // // FILE PATH: src/content/Notice.js
// // // ✅ Notice list with title + description preview + file pills
// // // ✅ Modal: Tab বিবরণ = full title+description
// // //           Tab PDF    = Google Drive iframe
// // //           Tab ফাইল   = view + download Cloudinary files
// // import React, { useState, useEffect, useCallback } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import {
// //   FileText, Download, Calendar, Bell, Image as ImageIcon,
// //   ChevronLeft, ChevronRight, X, ExternalLink, Clock,
// //   ZoomIn, ZoomOut, Loader, Search, Filter,
// // } from 'lucide-react';
// // import SkeletonLoader from '../components/SkeletonLoader';
// // import noticeService from '../services/noticeService';
// // import './Notice.css';

// // const fmtDate = d => new Date(d).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
// // const isNew7  = d => (Date.now() - new Date(d)) < 7 * 86400000;
// // const toDriveEmbed = (url = '') => {
// //   if (!url) return '';
// //   if (url.includes('/preview')) return url;
// //   const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
// //   if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
// //   const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
// //   if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
// //   return url;
// // };

// // const TYPE_CFG = {
// //   general:   { bg: '#e3f2fd', color: '#1565c0', label: 'সাধারণ'   },
// //   urgent:    { bg: '#ffebee', color: '#c62828', label: 'জরুরি'    },
// //   exam:      { bg: '#fff3e0', color: '#e65100', label: 'পরীক্ষা'  },
// //   holiday:   { bg: '#f3e5f5', color: '#7b1fa2', label: 'ছুটি'     },
// //   event:     { bg: '#e8f5e9', color: '#2e7d32', label: 'ইভেন্ট'   },
// //   admission: { bg: '#fce4ec', color: '#c2185b', label: 'ভর্তি'    },
// // };
// // const LIMIT = 15;

// // /* ══════════════════ FILE VIEWER ══════════════════════════ */
// // function FileViewer({ file, onClose }) {
// //   const [scale,  setScale]  = useState(1);
// //   const [loaded, setLoaded] = useState(false);
// //   const [pdfErr, setPdfErr] = useState(false);
// //   const [dlLoad, setDlLoad] = useState(false);
// //   const isImg = file.fileType === 'image' || !file.fileType?.includes('pdf');
// //   const isPdf = file.fileType === 'pdf';

// //   useEffect(() => {
// //     const h = e => { if (e.key === 'Escape') onClose(); };
// //     window.addEventListener('keydown', h);
// //     document.body.style.overflow = 'hidden';
// //     return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
// //   }, [onClose]);

// //   const dl = async () => {
// //     if (!file.fileUrl) return;
// //     setDlLoad(true);
// //     try {
// //       const res  = await fetch(file.fileUrl);
// //       const blob = await res.blob();
// //       const url  = URL.createObjectURL(blob);
// //       const a    = document.createElement('a');
// //       a.href = url; a.download = file.fileName || 'file';
// //       document.body.appendChild(a); a.click();
// //       document.body.removeChild(a); URL.revokeObjectURL(url);
// //     } catch { window.open(file.fileUrl, '_blank'); }
// //     finally { setDlLoad(false); }
// //   };

// //   return (
// //     <div className="fv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
// //       <div className="fv-box">
// //         <div className="fv-bar">
// //           <button className="fv-bar-btn back" onClick={onClose}>← ফিরুন</button>
// //           <span className="fv-bar-name">{file.fileName || 'ফাইল'}</span>
// //           {isImg && (
// //             <>
// //               <button className="fv-bar-btn" onClick={() => setScale(s => Math.max(s-.25,.25))}><ZoomOut size={14}/></button>
// //               <span className="fv-zoom">{Math.round(scale*100)}%</span>
// //               <button className="fv-bar-btn" onClick={() => setScale(s => Math.min(s+.25,5))}><ZoomIn size={14}/></button>
// //             </>
// //           )}
// //           <button className="fv-bar-btn dl" onClick={dl} disabled={dlLoad}>
// //             {dlLoad ? <Loader size={13} className="fv-spin"/> : <Download size={13}/>}
// //             {dlLoad ? 'ডাউনলোড...' : 'ডাউনলোড'}
// //           </button>
// //           <button className="fv-bar-btn close-btn" onClick={onClose}><X size={15}/></button>
// //         </div>
// //         <div className="fv-stage">
// //           {isImg && (
// //             <>
// //               {!loaded && <div className="fv-spin-wrap"><Loader size={38} className="fv-spin"/></div>}
// //               <img
// //                 src={file.fileUrl} alt={file.fileName || 'image'} className="fv-img"
// //                 style={{ transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
// //                 onLoad={() => setLoaded(true)}
// //               />
// //             </>
// //           )}
// //           {isPdf && !pdfErr && (
// //             <iframe src={`${file.fileUrl}#toolbar=1`} title={file.fileName}
// //               className="fv-iframe" onError={() => setPdfErr(true)} allowFullScreen/>
// //           )}
// //           {isPdf && pdfErr && (
// //             <div className="fv-err">
// //               <FileText size={48}/>
// //               <p>PDF দেখা যাচ্ছে না</p>
// //               <button className="fv-dl-btn2" onClick={dl}><Download size={13}/> ডাউনলোড করুন</button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ══════════════════ NOTICE MODAL ════════════════════════ */
// // function NoticeModal({ notice, onClose }) {
// //   const hasDrive = notice.driveLinks?.length > 0;
// //   const hasFiles = notice.attachments?.length > 0;
// //   const [tab,      setTab]      = useState('info');
// //   const [viewFile, setViewFile] = useState(null);
// //   const tc = TYPE_CFG[notice.type] || TYPE_CFG.general;

// //   useEffect(() => {
// //     const h = e => { if (e.key === 'Escape') { if (viewFile) setViewFile(null); else onClose(); } };
// //     window.addEventListener('keydown', h);
// //     document.body.style.overflow = 'hidden';
// //     return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
// //   }, [onClose, viewFile]);

// //   if (viewFile) return <FileViewer file={viewFile} onClose={() => setViewFile(null)}/>;

// //   return (
// //     <div className="nm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
// //       <div className="nm-modal">
// //         {/* Header */}
// //         <div className="nm-hd" style={{ borderTop: `5px solid ${tc.color}` }}>
// //           <div className="nm-hd-row">
// //             <span className="nm-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
// //             {isNew7(notice.publishDate) && <span className="nm-new">নতুন</span>}
// //             <div className="nm-meta-row">
// //               <span className="nm-date-span"><Calendar size={12}/>{fmtDate(notice.publishDate)}</span>
// //               {notice.expiryDate && <span className="nm-expiry"><Clock size={12}/>মেয়াদ: {fmtDate(notice.expiryDate)}</span>}
// //             </div>
// //             <button className="nm-x" onClick={onClose}><X size={18}/></button>
// //           </div>
// //           <h2 className="nm-title">{notice.title}</h2>
// //         </div>

// //         {/* Tabs */}
// //         {(hasDrive || hasFiles) && (
// //           <div className="nm-tabs">
// //             <button className={`nm-tab${tab==='info'?' active':''}`} onClick={() => setTab('info')}>📋 বিবরণ</button>
// //             {hasDrive && (
// //               <button className={`nm-tab${tab==='drive'?' active':''}`} onClick={() => setTab('drive')}>
// //                 📄 PDF <span className="nm-tc">{notice.driveLinks.length}</span>
// //               </button>
// //             )}
// //             {hasFiles && (
// //               <button className={`nm-tab${tab==='files'?' active':''}`} onClick={() => setTab('files')}>
// //                 📎 ফাইল <span className="nm-tc">{notice.attachments.length}</span>
// //               </button>
// //             )}
// //           </div>
// //         )}

// //         <div className="nm-body">
// //           {/* INFO */}
// //           {tab === 'info' && (
// //             <div className="nm-info-wrap">
// //               <div className="nm-info-block">
// //                 <p className="nm-lbl">📌 শিরোনাম</p>
// //                 <h3 className="nm-info-title">{notice.title}</h3>
// //               </div>
// //               {notice.description ? (
// //                 <div className="nm-info-block">
// //                   <p className="nm-lbl">📝 বিবরণ</p>
// //                   <div className="nm-desc-text">{notice.description}</div>
// //                 </div>
// //               ) : (
// //                 <div className="nm-empty-desc"><Bell size={26} color="#ccc"/><p>বিবরণ যোগ করা হয়নি।</p></div>
// //               )}
// //               {(hasDrive || hasFiles) && (
// //                 <div className="nm-shortcuts">
// //                   <p className="nm-lbl">📎 সংযুক্ত ফাইল</p>
// //                   <div className="nm-shortcut-pills">
// //                     {hasDrive && <button className="nm-sc-pill drive" onClick={() => setTab('drive')}><FileText size={13}/> PDF দেখুন</button>}
// //                     {hasFiles && <button className="nm-sc-pill files" onClick={() => setTab('files')}><ImageIcon size={13}/> ফাইলসমূহ</button>}
// //                   </div>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* DRIVE */}
// //           {tab === 'drive' && (
// //             <div className="nm-drive-wrap">
// //               {notice.driveLinks?.map((lnk, i) => (
// //                 <div key={i} className="nm-drive-item">
// //                   <div className="nm-drive-hd">
// //                     <FileText size={18} color="#c62828"/>
// //                     <span className="nm-drive-nm">{lnk.title || lnk.name || `PDF ${i+1}`}</span>
// //                     <a href={lnk.url || lnk} target="_blank" rel="noopener noreferrer" className="nm-drive-open-btn">
// //                       <ExternalLink size={13}/> নতুন ট্যাবে খুলুন
// //                     </a>
// //                   </div>
// //                   <div className="nm-drive-frame">
// //                     <iframe src={toDriveEmbed(lnk.url || lnk)} title={`PDF ${i+1}`} className="nm-drive-iframe" allowFullScreen/>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}

// //           {/* FILES */}
// //           {tab === 'files' && (
// //             <div className="nm-files-grid">
// //               {notice.attachments?.map((att, i) => {
// //                 const isImg = att.fileType === 'image' || !att.fileType?.includes('pdf');
// //                 const isPdf = att.fileType === 'pdf';
// //                 return (
// //                   <div key={i} className="nm-file-card">
// //                     {isImg && att.fileUrl && (
// //                       <div className="nm-fc-thumb" onClick={() => setViewFile(att)}>
// //                         <img src={att.fileUrl} alt={att.fileName || 'ছবি'}/>
// //                         <div className="nm-fc-ov"><ZoomIn size={20}/></div>
// //                       </div>
// //                     )}
// //                     {isPdf && (
// //                       <div className="nm-fc-pdf" onClick={() => setViewFile(att)}>
// //                         <FileText size={38} color="#c62828"/>
// //                         <span>PDF</span>
// //                       </div>
// //                     )}
// //                     <div className="nm-fc-info">
// //                       <p className="nm-fc-name">{att.fileName || (isImg ? 'ছবি' : 'PDF ফাইল')}</p>
// //                       <div className="nm-fc-btns">
// //                         <button className="nm-fc-btn view" onClick={() => setViewFile(att)}><ExternalLink size={12}/> দেখুন</button>
// //                         {att.fileUrl && (
// //                           <a href={att.fileUrl} download target="_blank" rel="noopener noreferrer" className="nm-fc-btn dl">
// //                             <Download size={12}/> ডাউনলোড
// //                           </a>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ══════════════════ MAIN NOTICE PAGE ════════════════════ */
// // const Notice = () => {
// //   const { id }   = useParams();
// //   const navigate  = useNavigate();
// //   const [notices,      setNotices]      = useState([]);
// //   const [loading,      setLoading]      = useState(true);
// //   const [activeNotice, setActiveNotice] = useState(null);
// //   const [currentPage,  setCurrentPage]  = useState(1);
// //   const [pagination,   setPagination]   = useState({ totalPages: 1, totalNotices: 0 });
// //   const [search,       setSearch]       = useState('');
// //   const [filterType,   setFilterType]   = useState('');

// //   const fetchNotices = useCallback(async (page = 1) => {
// //     try {
// //       setLoading(true);
// //       const res = await noticeService.getPublicNotices(page, LIMIT);
// //       const data = res.data || [];
// //       setNotices(data);
// //       setPagination({
// //         totalPages:   res.totalPages   || 1,
// //         totalNotices: res.totalNotices || data.length,
// //         hasPrevPage:  page > 1,
// //         hasNextPage:  page < (res.totalPages || 1),
// //       });
// //     } catch (e) { console.error(e); }
// //     finally { setLoading(false); }
// //   }, []);

// //   useEffect(() => { fetchNotices(currentPage); }, [currentPage, fetchNotices]);

// //   useEffect(() => {
// //     if (!id || notices.length === 0) return;
// //     const found = notices.find(n => n._id === id);
// //     if (found) setActiveNotice(found);
// //   }, [id, notices]);

// //   const openNotice  = (n) => { setActiveNotice(n); navigate(`/notices/${n._id}`, { replace: true }); };
// //   const closeNotice = ()  => { setActiveNotice(null); navigate('/notices', { replace: true }); };

// //   const goPage = p => {
// //     if (p < 1 || p > pagination.totalPages) return;
// //     setCurrentPage(p);
// //     window.scrollTo({ top: 0, behavior: 'smooth' });
// //   };

// //   const filtered = notices.filter(n => {
// //     const ms = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.description?.toLowerCase().includes(search.toLowerCase());
// //     const mt = !filterType || n.type === filterType;
// //     return ms && mt;
// //   });

// //   const pageButtons = () => {
// //     const btns = [];
// //     const s = Math.max(1, currentPage - 2);
// //     const e = Math.min(pagination.totalPages, currentPage + 2);
// //     for (let p = s; p <= e; p++) {
// //       btns.push(
// //         <button key={p} className={`np-pg-btn${p===currentPage?' current':''}`} onClick={() => goPage(p)}>{p}</button>
// //       );
// //     }
// //     return btns;
// //   };

// //   return (
// //     <div className="np-root">
// //       <div className="np-container">
// //         {/* Header */}
// //         <div className="np-hd">
// //           <div className="np-hd-left">
// //             <div className="np-bell-wrap"><Bell size={22}/></div>
// //             <div>
// //               <h1>নোটিশ বোর্ড</h1>
// //               <p className="np-hd-sub">Notice Board — মালখানগর কলেজ</p>
// //             </div>
// //           </div>
// //           {pagination.totalNotices > 0 && <span className="np-total">{pagination.totalNotices} টি নোটিশ</span>}
// //         </div>

// //         {/* Filters */}
// //         <div className="np-filters">
// //           <div className="np-search">
// //             <Search size={14}/>
// //             <input type="text" placeholder="নোটিশ খুঁজুন..." value={search}
// //               onChange={e => setSearch(e.target.value)} className="np-search-inp"/>
// //           </div>
// //           <div className="np-type-filter">
// //             <Filter size={13}/>
// //             <select value={filterType} onChange={e => setFilterType(e.target.value)} className="np-type-sel">
// //               <option value="">সব ধরন</option>
// //               {Object.entries(TYPE_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
// //             </select>
// //           </div>
// //         </div>

// //         {!loading && pagination.totalNotices > 0 && (
// //           <p className="np-range">
// //             দেখানো হচ্ছে {(currentPage-1)*LIMIT+1}–{Math.min(currentPage*LIMIT, pagination.totalNotices)} / মোট {pagination.totalNotices}
// //           </p>
// //         )}

// //         {/* List */}
// //         {loading ? (
// //           <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:16 }}>
// //             {[1,2,3,4,5].map(i => <SkeletonLoader key={i} type="card"/>)}
// //           </div>
// //         ) : filtered.length === 0 ? (
// //           <div className="np-empty"><Bell size={60} color="#ccc"/><p>কোনো নোটিশ পাওয়া যায়নি</p></div>
// //         ) : (
// //           <div className="np-list">
// //             {filtered.map(n => {
// //               const tc = TYPE_CFG[n.type] || TYPE_CFG.general;
// //               const hd = n.driveLinks?.length > 0;
// //               const hf = n.attachments?.length > 0;
// //               return (
// //                 <div key={n._id} className="np-item">
// //                   <div className="np-item-accent" style={{ background: tc.color }}/>
// //                   <div className="np-item-body">
// //                     <div className="np-item-top">
// //                       <div className="np-tags">
// //                         <span className="np-type-tag" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
// //                         {isNew7(n.publishDate) && <span className="np-new-tag">নতুন</span>}
// //                       </div>
// //                       <span className="np-date"><Calendar size={12}/>{fmtDate(n.publishDate)}</span>
// //                     </div>
// //                     <h4 className="np-title" onClick={() => openNotice(n)}>{n.title}</h4>
// //                     {n.description && (
// //                       <p className="np-desc-preview">
// //                         {n.description.length > 150 ? n.description.slice(0,150)+'…' : n.description}
// //                       </p>
// //                     )}
// //                     {(hd || hf) && (
// //                       <div className="np-pills">
// //                         {hd && <button className="np-pill drive" onClick={() => openNotice(n)}><FileText size={11}/> {n.driveLinks.length} PDF</button>}
// //                         {hf && n.attachments.map((att,i) => (
// //                           <button key={i} className={`np-pill ${att.fileType}`} onClick={() => openNotice(n)}>
// //                             {att.fileType==='pdf' ? <FileText size={11}/> : <ImageIcon size={11}/>}
// //                             {att.fileName ? att.fileName.slice(0,18)+'…' : att.fileType?.toUpperCase()}
// //                           </button>
// //                         ))}
// //                       </div>
// //                     )}
// //                   </div>
// //                   <button className="np-view-btn" onClick={() => openNotice(n)}>দেখুন →</button>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}

// //         {/* Pagination */}
// //         {pagination.totalPages > 1 && (
// //           <div className="np-pagination">
// //             <button className="np-nav" onClick={() => goPage(currentPage-1)} disabled={!pagination.hasPrevPage}>
// //               <ChevronLeft size={15}/> আগের
// //             </button>
// //             <div className="np-pg-nums">
// //               {currentPage > 3 && (<><button className="np-pg-btn" onClick={() => goPage(1)}>1</button>{currentPage > 4 && <span className="np-dots">…</span>}</>)}
// //               {pageButtons()}
// //               {currentPage < pagination.totalPages-2 && (<>{currentPage < pagination.totalPages-3 && <span className="np-dots">…</span>}<button className="np-pg-btn" onClick={() => goPage(pagination.totalPages)}>{pagination.totalPages}</button></>)}
// //             </div>
// //             <button className="np-nav" onClick={() => goPage(currentPage+1)} disabled={!pagination.hasNextPage}>
// //               পরের <ChevronRight size={15}/>
// //             </button>
// //           </div>
// //         )}
// //       </div>

// //       {activeNotice && <NoticeModal notice={activeNotice} onClose={closeNotice}/>}
// //     </div>
// //   );
// // };

// // export default Notice;



// FILE PATH: src/content/Notice.js
// Drive PDF link → shows ⬇️ Download button
//   click → window.open(downloadUrl, '_blank')
//   downloadUrl = https://drive.google.com/uc?export=download&id=FILE_ID
//   (auto-generated by backend, backfilled if missing)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, Calendar, Bell, Image as ImageIcon,
  ChevronLeft, ChevronRight, X, ExternalLink, Clock,
  ZoomIn, ZoomOut, Loader, Search, Filter,
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import noticeService from '../services/noticeService';
import './Notice.css';

/* ── helpers ── */
const fmtDate = d => new Date(d).toLocaleDateString('bn-BD', {
  day: 'numeric', month: 'short', year: 'numeric',
});
const isNew7 = d => (Date.now() - new Date(d)) < 7 * 86400000;

/** Drive share URL → embed preview URL */
const toDriveEmbed = (url = '') => {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
  const m2 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  const m3 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m3) return `https://drive.google.com/file/d/${m3[1]}/preview`;
  return url;
};

/** Drive share URL → direct download URL (fallback if backend didn't provide it) */
const toDriveDownload = (url = '') => {
  if (!url) return '';
  if (url.includes('export=download')) return url;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/uc?export=download&id=${m1[1]}`;
  const m2 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`;
  const m3 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m3) return `https://drive.google.com/uc?export=download&id=${m3[1]}`;
  return url;
};

const TYPE_CFG = {
  general:   { bg: '#e3f2fd', color: '#1565c0', label: 'সাধারণ'  },
  urgent:    { bg: '#ffebee', color: '#c62828', label: 'জরুরি'   },
  exam:      { bg: '#fff3e0', color: '#e65100', label: 'পরীক্ষা' },
  holiday:   { bg: '#f3e5f5', color: '#7b1fa2', label: 'ছুটি'    },
  event:     { bg: '#e8f5e9', color: '#2e7d32', label: 'ইভেন্ট'  },
  admission: { bg: '#fce4ec', color: '#c2185b', label: 'ভর্তি'   },
};
const LIMIT = 15;

/* ════════════ CLOUDINARY FILE VIEWER ════════════════════════ */
function FileViewer({ file, onClose }) {
  const [scale, setScale]   = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [pdfErr, setPdfErr] = useState(false);
  const [dlLoad, setDlLoad] = useState(false);
  const isImg = file.fileType === 'image' || !file.fileType?.includes('pdf');
  const isPdf = file.fileType === 'pdf';

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const dl = async () => {
    setDlLoad(true);
    try {
      const res  = await fetch(file.fileUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName || `file.${isPdf ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { window.open(file.fileUrl, '_blank'); }
    finally  { setDlLoad(false); }
  };

  return (
    <div className="fv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fv-box">
        <div className="fv-bar">
          <button className="fv-btn back" onClick={onClose}>← ফিরুন</button>
          <span className="fv-name">{file.fileName || 'ফাইল'}</span>
          {isImg && <>
            <button className="fv-btn" onClick={() => setScale(s => Math.max(s - .25, .25))}><ZoomOut size={14}/></button>
            <span className="fv-zoom">{Math.round(scale * 100)}%</span>
            <button className="fv-btn" onClick={() => setScale(s => Math.min(s + .25, 5))}><ZoomIn size={14}/></button>
          </>}
          <button className="fv-btn fv-dl" onClick={dl} disabled={dlLoad}>
            {dlLoad ? <Loader size={13} className="fv-spin"/> : <Download size={13}/>}
            {dlLoad ? 'ডাউনলোড...' : 'ডাউনলোড'}
          </button>
          <button className="fv-btn fv-x" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="fv-stage">
          {isImg && <>
            {!loaded && <div className="fv-spin-c"><Loader size={36} className="fv-spin"/></div>}
            <img src={file.fileUrl} alt={file.fileName || ''} className="fv-img"
              style={{ transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
              onLoad={() => setLoaded(true)}/>
          </>}
          {isPdf && !pdfErr && <iframe src={`${file.fileUrl}#toolbar=1`} title={file.fileName}
            className="fv-iframe" onError={() => setPdfErr(true)} allowFullScreen/>}
          {isPdf && pdfErr && <div className="fv-err">
            <FileText size={46}/>
            <p>PDF দেখা যাচ্ছে না</p>
            <button className="fv-dl-fb" onClick={dl}><Download size={13}/> ডাউনলোড</button>
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ════════════ NOTICE MODAL ═══════════════════════════════════ */
function NoticeModal({ notice, onClose }) {
  const hasDrive = notice.driveLinks?.length > 0;
  const hasFiles = notice.attachments?.length > 0;
  const [tab,      setTab]      = useState('info');
  const [viewFile, setViewFile] = useState(null);
  const tc = TYPE_CFG[notice.type] || TYPE_CFG.general;

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') { if (viewFile) setViewFile(null); else onClose(); } };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose, viewFile]);

  /* Download Cloudinary file */
  const dlFile = async att => {
    try {
      const res  = await fetch(att.fileUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.fileName || `notice.${att.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { window.open(att.fileUrl, '_blank'); }
  };

  if (viewFile) return <FileViewer file={viewFile} onClose={() => setViewFile(null)}/>;

  return (
    <div className="nm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nm-modal">

        {/* Header */}
        <div className="nm-hd" style={{ borderTop: `5px solid ${tc.color}` }}>
          <div className="nm-hd-row">
            <span className="nm-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
            {isNew7(notice.publishDate) && <span className="nm-new">নতুন</span>}
            <div className="nm-meta">
              <Calendar size={12}/>{fmtDate(notice.publishDate)}
              {notice.expiryDate && <span className="nm-exp"><Clock size={12}/>মেয়াদ: {fmtDate(notice.expiryDate)}</span>}
            </div>
            <button className="nm-x" onClick={onClose}><X size={18}/></button>
          </div>
          <h2 className="nm-title">{notice.title}</h2>
        </div>

        {/* Tabs */}
        {(hasDrive || hasFiles) && (
          <div className="nm-tabs">
            <button className={`nm-tab${tab==='info'?' on':''}`} onClick={() => setTab('info')}>📋 বিবরণ</button>
            {hasDrive && <button className={`nm-tab${tab==='drive'?' on':''}`} onClick={() => setTab('drive')}>
              📄 PDF <span className="nm-tc">{notice.driveLinks.length}</span>
            </button>}
            {hasFiles && <button className={`nm-tab${tab==='files'?' on':''}`} onClick={() => setTab('files')}>
              📎 ফাইল <span className="nm-tc">{notice.attachments.length}</span>
            </button>}
          </div>
        )}

        <div className="nm-body">

          {/* ── বিবরণ tab ── */}
          {tab === 'info' && (
            <div className="nm-info">
              <div className="nm-block">
                <p className="nm-lbl">শিরোনাম</p>
                <h3 className="nm-ititle">{notice.title}</h3>
              </div>
              {notice.description
                ? <div className="nm-block"><p className="nm-lbl">বিবরণ</p><p className="nm-desc">{notice.description}</p></div>
                : <div className="nm-nodesc"><Bell size={24} color="#ccc"/><p>বিবরণ যোগ করা হয়নি।</p></div>
              }
              {(hasDrive || hasFiles) && (
                <div className="nm-sc">
                  <p className="nm-lbl">সংযুক্ত ফাইল</p>
                  <div className="nm-sc-pills">
                    {hasDrive && <button className="nm-sc-btn drive" onClick={() => setTab('drive')}>📄 PDF দেখুন</button>}
                    {hasFiles && <button className="nm-sc-btn files" onClick={() => setTab('files')}>📎 ফাইলসমূহ</button>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PDF tab (Drive) ── */}
          {tab === 'drive' && (
            <div className="nm-drive-list">
              {notice.driveLinks?.map((lnk, i) => {
                // Use backend-provided downloadUrl, else build it client-side
                const dlUrl = lnk.downloadUrl || toDriveDownload(lnk.url || '');
                return (
                  <div key={i} className="nm-ditem">
                    <div className="nm-dbar">
                      <FileText size={16} color="#7c3aed"/>
                      <span className="nm-dname">{lnk.label || lnk.title || `PDF ${i+1}`}</span>

                      {/* ── DOWNLOAD BUTTON ── */}
                      <a
                        href={dlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nm-dl-btn"
                        title="PDF ডাউনলোড করুন"
                      >
                        <Download size={14}/> ডাউনলোড
                      </a>

                      <a href={lnk.url} target="_blank" rel="noopener noreferrer" className="nm-open-btn">
                        <ExternalLink size={13}/> খুলুন
                      </a>
                    </div>

                    {/* Embedded preview */}
                    <div className="nm-dframe">
                      <iframe
                        src={toDriveEmbed(lnk.url)}
                        title={lnk.label || `PDF ${i+1}`}
                        className="nm-iframe"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Files tab (Cloudinary) ── */}
          {tab === 'files' && (
            <div className="nm-fgrid">
              {notice.attachments?.map((att, i) => {
                const isImg = att.fileType === 'image' || !att.fileType?.includes('pdf');
                return (
                  <div key={i} className="nm-fcard">
                    {isImg && att.fileUrl
                      ? <div className="nm-fthumb" onClick={() => setViewFile(att)}>
                          <img src={att.fileUrl} alt={att.fileName || 'ছবি'}/>
                          <div className="nm-fov"><ZoomIn size={20}/></div>
                        </div>
                      : <div className="nm-fpdf" onClick={() => setViewFile(att)}>
                          <FileText size={36} color="#ef4444"/><span>PDF</span>
                        </div>
                    }
                    <div className="nm-finfo">
                      <p className="nm-fname">{att.fileName || (isImg ? 'ছবি' : 'PDF')}</p>
                      <div className="nm-fbtns">
                        <button className="nm-fbtn view" onClick={() => setViewFile(att)}>
                          <ExternalLink size={12}/> দেখুন
                        </button>
                        {att.fileUrl && (
                          <button className="nm-fbtn dl" onClick={() => dlFile(att)}>
                            <Download size={12}/> ডাউনলোড
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════ MAIN PAGE ══════════════════════════════════════ */
const Notice = () => {
  const { id }  = useParams();
  const navigate = useNavigate();
  const [notices,      setNotices]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeNotice, setActiveNotice] = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pagination,   setPagination]   = useState({ totalPages: 1, totalNotices: 0 });
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');

  const fetchNotices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await noticeService.getPublicNotices(page, LIMIT);
      setNotices(res.data || []);
      setPagination({
        totalPages:   res.totalPages   || 1,
        totalNotices: res.totalNotices || (res.data || []).length,
        hasPrevPage:  page > 1,
        hasNextPage:  page < (res.totalPages || 1),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotices(currentPage); }, [currentPage, fetchNotices]);

  useEffect(() => {
    if (!id || notices.length === 0) return;
    const found = notices.find(n => n._id === id);
    if (found) setActiveNotice(found);
  }, [id, notices]);

  const open  = n => { setActiveNotice(n); navigate(`/notices/${n._id}`, { replace: true }); };
  const close = () => { setActiveNotice(null); navigate('/notices', { replace: true }); };
  const goPage = p => {
    if (p < 1 || p > pagination.totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = notices.filter(n => {
    const ms = !search || n.title?.toLowerCase().includes(search.toLowerCase()) ||
               n.description?.toLowerCase().includes(search.toLowerCase());
    const mt = !filterType || n.type === filterType;
    return ms && mt;
  });

  const pgBtns = () => {
    const btns = [];
    for (let p = Math.max(1, currentPage - 2); p <= Math.min(pagination.totalPages, currentPage + 2); p++) {
      btns.push(<button key={p} className={`np-pg${p === currentPage ? ' on' : ''}`} onClick={() => goPage(p)}>{p}</button>);
    }
    return btns;
  };

  return (
    <div className="np-root">
      <div className="np-wrap">

        {/* Header */}
        <div className="np-hd">
          <div className="np-hd-l">
            <div className="np-bell"><Bell size={20}/></div>
            <div>
              <h1>নোটিশ বোর্ড</h1>
              <p>Notice Board — মালখানগর কলেজ</p>
            </div>
          </div>
          {pagination.totalNotices > 0 && (
            <span className="np-count">{pagination.totalNotices} টি নোটিশ</span>
          )}
        </div>

        {/* Filters */}
        <div className="np-filters">
          <div className="np-search"><Search size={13}/><input type="text" placeholder="নোটিশ খুঁজুন..."
            value={search} onChange={e => setSearch(e.target.value)}/></div>
          <div className="np-ftype"><Filter size={12}/><select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">সব ধরন</option>
            {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select></div>
        </div>

        {!loading && pagination.totalNotices > 0 && (
          <p className="np-range">দেখানো: {(currentPage-1)*LIMIT+1}–{Math.min(currentPage*LIMIT, pagination.totalNotices)} / মোট {pagination.totalNotices}</p>
        )}

        {/* List */}
        {loading
          ? <div className="np-loading">{[1,2,3,4,5].map(i => <SkeletonLoader key={i} type="card"/>)}</div>
          : filtered.length === 0
            ? <div className="np-empty"><Bell size={56} color="#ccc"/><p>কোনো নোটিশ নেই</p></div>
            : <div className="np-list">
                {filtered.map(n => {
                  const tc = TYPE_CFG[n.type] || TYPE_CFG.general;
                  const hd = n.driveLinks?.length > 0;
                  const hf = n.attachments?.length > 0;
                  return (
                    <div key={n._id} className="np-item">
                      <div className="np-accent" style={{ background: tc.color }}/>
                      <div className="np-ibody">
                        <div className="np-itop">
                          <div className="np-tags">
                            <span className="np-tag" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                            {isNew7(n.publishDate) && <span className="np-new">নতুন</span>}
                          </div>
                          <span className="np-date"><Calendar size={11}/>{fmtDate(n.publishDate)}</span>
                        </div>
                        <h4 className="np-title" onClick={() => open(n)}>{n.title}</h4>
                        {n.description && (
                          <p className="np-desc">{n.description.length > 150 ? n.description.slice(0, 150) + '…' : n.description}</p>
                        )}
                        {(hd || hf) && (
                          <div className="np-pills">
                            {hd && <button className="np-pill drive" onClick={() => open(n)}>
                              <FileText size={11}/> {n.driveLinks.length} PDF
                            </button>}
                            {hf && n.attachments.map((a, i) => (
                              <button key={i} className={`np-pill ${a.fileType}`} onClick={() => open(n)}>
                                {a.fileType === 'pdf' ? <FileText size={11}/> : <ImageIcon size={11}/>}
                                {a.fileName ? a.fileName.slice(0, 16) + (a.fileName.length > 16 ? '…' : '') : a.fileType?.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="np-view" onClick={() => open(n)}>দেখুন →</button>
                    </div>
                  );
                })}
              </div>
        }

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="np-pag">
            <button className="np-nav" onClick={() => goPage(currentPage - 1)} disabled={!pagination.hasPrevPage}>
              <ChevronLeft size={14}/> আগের
            </button>
            <div className="np-pgnums">
              {currentPage > 3 && <><button className="np-pg" onClick={() => goPage(1)}>1</button>{currentPage > 4 && <span>…</span>}</>}
              {pgBtns()}
              {currentPage < pagination.totalPages - 2 && <>{currentPage < pagination.totalPages - 3 && <span>…</span>}
                <button className="np-pg" onClick={() => goPage(pagination.totalPages)}>{pagination.totalPages}</button></>}
            </div>
            <button className="np-nav" onClick={() => goPage(currentPage + 1)} disabled={!pagination.hasNextPage}>
              পরের <ChevronRight size={14}/>
            </button>
          </div>
        )}
      </div>

      {activeNotice && <NoticeModal notice={activeNotice} onClose={close}/>}
    </div>
  );
};

export default Notice;