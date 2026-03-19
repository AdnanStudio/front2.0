// src/content/pages/ContentPageShell.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ContentPageShell.css';

const SUB_NAVS = {
  '/about': [
    {l:'College History',p:'/about/history'},{l:'Mission & Vision',p:'/about/mission-vision'},
    {l:'Facilities',p:'/about/facilities'},{l:'Achievements',p:'/about/achievements'},
    {l:'Faculty Council',p:'/about/faculty-council'},{l:'Organogram',p:'/about/organogram'},
    {l:'Staff & Employees',p:'/about/staff'},{l:'Governing Body',p:'/administration/governing-body'},
    {l:"Principal's Message",p:'/about/principal'},
  ],
  '/administration': [
    {l:'Teachers',p:'/administration/teachers'},{l:'Governing Body',p:'/administration/governing-body'},
    {l:'Teacher Training',p:'/administration/teacher-training'},{l:'Club Management',p:'/administration/club-management'},
  ],
  '/academic': [
    {l:'Programs',p:'/academic/programs'},{l:'Departments',p:'/academic/departments'},
    {l:'Syllabus',p:'/academic/syllabus'},{l:'Academic Calendar',p:'/academic/calendar'},
    {l:'HSC Class Routine',p:'/academic/hsc-routine'},{l:'Degree Pass Course',p:'/academic/degree-pass'},
    {l:'Degree Honours',p:'/academic/degree-honors'},
  ],
  '/admission': [
    {l:'Apply Online',p:'/admission/apply'},{l:'Requirements',p:'/admission/requirements'},
    {l:'Procedure',p:'/admission/procedure'},{l:'HSC Admission',p:'/admission/hsc'},
    {l:'Degree Pass',p:'/admission/degree-pass'},{l:'Degree (Honours)',p:'/admission/degree'},
  ],
  '/gallery': [
    {l:'Photo Gallery',p:'/gallery/photos'},{l:'Video Gallery',p:'/gallery/videos'},{l:'Events',p:'/gallery/events'},
  ],
  '/result': [
    {l:'Admit Card',p:'/result/admit-card'},{l:'Internal Result',p:'/result/internal'},
    {l:'HSC Result',p:'/result/hsc'},{l:'Degree Pass Result',p:'/result/degree-pass'},{l:'Degree Result',p:'/result/degree'},
  ],
  '/form': [
    {l:'HSC Form',p:'/form/hsc'},{l:'Degree Pass Form',p:'/form/degree-pass'},{l:'Degree Form',p:'/form/degree'},
  ],
};
function getSubNav(pathname) {
  for (const prefix of Object.keys(SUB_NAVS))
    if (pathname.startsWith(prefix)) return SUB_NAVS[prefix];
  return null;
}

export default function ContentPageShell({ title, banglaTitle, icon='📄', children, breadcrumb=[] }) {
  const { pathname } = useLocation();
  const sub = getSubNav(pathname);
  return (
    <div className="cps-root">
      <div className="cps-bc">
        <div className="cps-bc-inner">
          <Link to="/">হোম</Link>
          {breadcrumb.map((b,i)=>(
            <span key={i}><span className="cps-sep"> › </span>
              {b.path?<Link to={b.path}>{b.label}</Link>:<span>{b.label}</span>}
            </span>
          ))}
          <span className="cps-sep"> › </span>
          <span className="cps-cur">{banglaTitle||title}</span>
        </div>
      </div>
      <div className="cps-head">
        <div className="cps-head-inner">
          <span className="cps-head-icon">{icon}</span>
          <div>
            <h1 className="cps-head-title">{title}</h1>
            {banglaTitle&&title!==banglaTitle&&<p className="cps-head-sub">{banglaTitle}</p>}
          </div>
        </div>
      </div>
      {sub&&(
        <div className="cps-subnav">
          <div className="cps-subnav-inner">
            {sub.map((item,i)=>(
              <Link key={i} to={item.p} className={`cps-sn-a${pathname===item.p?' active':''}`}>{item.l}</Link>
            ))}
          </div>
        </div>
      )}
      <div className="cps-body"><div className="cps-body-inner">{children}</div></div>
    </div>
  );
}
export function Section({ title, children }) {
  return <div className="cps-section">{title&&<h2>{title}</h2>}{children}</div>;
}
export function InfoBox({ title, items, color='#2e7d32' }) {
  return (
    <div className="cps-infobox" style={{borderLeftColor:color}}>
      {title&&<h3 style={{color}}>{title}</h3>}
      <ul>{items.map((it,i)=><li key={i}><span className="cps-dot">◆</span>{it}</li>)}</ul>
    </div>
  );
}
export function Alert({ type='info', children }) {
  return <div className={`cps-alert cps-alert-${type}`}>{children}</div>;
}
export function CpsTable({ headers, rows }) {
  return (
    <div className="cps-tbl-wrap">
      <table className="cps-tbl">
        <thead><tr>{headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
export function CardGrid({ cards }) {
  return (
    <div className="cps-card-grid">
      {cards.map((c,i)=>(
        <div key={i} className="cps-mini-card" style={c.color?{borderTopColor:c.color}:{}}>
          {c.icon&&<div className="cps-mc-icon">{c.icon}</div>}
          <h4>{c.title}</h4>
          {c.text&&<p>{c.text}</p>}
          {c.items&&<ul>{c.items.map((it,j)=><li key={j}>{it}</li>)}</ul>}
        </div>
      ))}
    </div>
  );
}