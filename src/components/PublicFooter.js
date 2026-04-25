// src/components/PublicFooter.js
// Dynamic: school name, address, phone, email from GET /api/settings
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PublicFooter.css';
const API = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';
const QUICK_LINKS = [
  ['/','হোম'],['/about','প্রতিষ্ঠান পরিচিতি'],['/academic','একাডেমিক'],
  ['/administration/teachers','শিক্ষকবৃন্দ'],['/admission','এডমিশন'],
  ['/notices','নোটিশ বোর্ড'],['/gallery/photos','গ্যালারি'],['/contact','যোগাযোগ'],
];
const IMP = [
  ['https://moedu.gov.bd','শিক্ষা মন্ত্রণালয়'],
  ['https://www.nu.ac.bd','জাতীয় বিশ্ববিদ্যালয়'],
  ['https://dhakaeducationboard.gov.bd','ঢাকা শিক্ষা বোর্ড'],
  ['https://emis.gov.bd','EMIS | DSHE'],
  ['https://teachers.gov.bd','শিক্ষক বাতায়ন'],
  ['https://www.bangladesh.gov.bd','জাতীয় তথ্য বাতায়ন'],
];

const APP_DOWNLOAD_LINK = 'https://drive.google.com/file/d/1nDxWsojWT5kgC0UXtnT2v8XQ5tB3u-On/view';

export default function PublicFooter() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    fetch(`${API}/settings`).then(r=>r.json()).then(d=>{ if(d.success&&d.data) setSettings(d.data); }).catch(()=>{});
  }, []);
  const name    = settings?.schoolName    || '𝖬𝖺𝗅𝗄𝗁𝖺𝗇𝖺𝗀𝖺𝗋 𝖢𝗈𝗅𝗅𝖾𝗀𝖾';
  const address = settings?.schoolAddress || '𝖲𝗂𝗋𝖺𝗃𝖽𝗂𝗄𝗁𝖺𝗇, 𝖬𝗎𝗇𝗌𝗁𝗂𝗀𝖺𝗇𝗃, 𝖣𝗁𝖺𝗄𝖺';
  const phone   = settings?.schoolPhone   || '𝟎𝟏𝟑𝟎𝟗-𝟏𝟑𝟒𝟓𝟗𝟎';
  const email   = settings?.schoolEmail   || '𝙼𝚊𝚕𝚔𝚑𝚊𝚗𝚊𝚐𝚊𝚛𝙲𝚘𝚕𝚕𝚎𝚐𝚎@𝚐𝚖𝚊𝚒𝚕.𝚌𝚘𝚖';
  return (
    <footer className="pf-root">
      <div className="pf-main">
        <div className="pf-inner">
          <div className="pf-col">
            <div className="pf-logo-row">
              <img src="/logo.png" alt="লোগো" className="pf-logo" />
              <div><h3 className="pf-cname">{name}</h3><p className="pf-csub">𝖲𝗂𝗋𝖺𝗃𝖽𝗂𝗄𝗁𝖺𝗇, 𝖬𝗎𝗇𝗌𝗁𝗂𝗀𝖺𝗇𝗃, 𝖣𝗁𝖺𝗄𝖺</p></div>
            </div>
            <div className="pf-contact">
              <p><span>📍</span> {address}</p>
              <p><span>📞</span> {phone}</p>
              <p><span>✉️</span> {email}</p>
            </div>
          </div>
          <div className="pf-col">
            <h4 className="pf-col-title">দ্রুত লিঙ্ক</h4>
            {QUICK_LINKS.map(([path,label],i)=>(
              <Link key={i} to={path} className="pf-link"><span className="pf-larr">▶</span> {label}</Link>
            ))}
          </div>
          <div className="pf-col">
            <h4 className="pf-col-title">গুরুত্বপূর্ণ লিঙ্ক</h4>
            {IMP.map(([url,label],i)=>(
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="pf-link"><span className="pf-larr">▶</span> {label}</a>
            ))}
          </div>
          <div className="pf-col">
            <h4 className="pf-col-title">কলেজ তথ্য</h4>
            {[['প্রতিষ্ঠা:','১৯৯২'],['EIIN:','𝟏𝟑𝟒𝟓𝟗𝟎']].map(([l,v],i)=>(
              <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
                <span style={{color:'#a5d6a7',fontSize:16,fontWeight:600,minWidth:60}}>{l}</span>
                <span style={{color:'#fff',fontSize:16}}>{v}</span>
              </div>
            ))}

            {/* ── App Download Button ── */}
            <div className="pf-app-section">
              <p className="pf-app-label">আমাদের অ্যাপ ডাউনলোড করুন</p>
              <a
                href={APP_DOWNLOAD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-playstore-btn"
              >
                {/* Google Play SVG Icon */}
                <svg className="pf-play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.18 23.76c.3.17.64.24.98.2L15.34 12 11.6 8.26 3.18 23.76z" fill="#EA4335"/>
                  <path d="M20.47 10.34l-2.78-1.59-3.93 3.25 3.93 3.93 2.8-1.6a2.14 2.14 0 0 0 0-4z" fill="#FBBC04"/>
                  <path d="M3.18.24A2.1 2.1 0 0 0 2 2.13v19.74c0 .78.43 1.46 1.18 1.89L15.34 12 3.18.24z" fill="#34A853"/>
                  <path d="M3.18.24L15.34 12l3.35-3.25-11.7-6.7A2.18 2.18 0 0 0 3.18.24z" fill="#4285F4"/>
                </svg>
                <div className="pf-play-text">
                  <span className="pf-play-sub">GET IT ON</span>
                  <span className="pf-play-main">Google Play</span>
                </div>
              </a>
            </div>

          </div>
        </div>
      </div>
      <div className="pf-bottom">
        <div className="pf-bottom-inner">
          <p>All rights reserved © {new Date().getFullYear()}, {name}.</p>
          <p>Design by <a href="https://amaderwebsite.com.bd" target="_blank" rel="noopener noreferrer">আমাদের ওয়েবসাইট</a></p>
        </div>
      </div>
    </footer>
  );
}