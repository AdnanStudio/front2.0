import React from 'react';
import ContentPageShell, { Section } from './ContentPageShell';
export default function Organogram() {
  return (
    <ContentPageShell title="Organogram" banglaTitle="অর্গানোগ্রাম" icon="🏢"
      breadcrumb={[{label:'প্রতিষ্ঠান পরিচিতি',path:'/about'}]}>
      <Section title="মালখানগর কলেজ — প্রশাসনিক কাঠামো">
        <p>মালখানগর কলেজের প্রশাসনিক কাঠামো শিক্ষা মন্ত্রণালয়ের নির্দেশনা অনুযায়ী গঠিত। নিচে কলেজের প্রশাসনিক শ্রেণিবিন্যাস উপস্থাপন করা হলো।</p>
      </Section>
      <div className="org-wrap">
        <div className="org-chart">
          <div><div className="org-box org-top">পরিচালনা পর্ষদ<br/><small>Governing Body</small></div></div>
          <div className="org-vline"/>
          <div><div className="org-box org-mid">অধ্যক্ষ<br/><small>Principal</small></div></div>
          <div className="org-vline"/>
          <div className="org-row-3">
            <div className="org-col"><div className="org-box org-sub">উপাধ্যক্ষ<br/><small>Vice Principal</small></div></div>
            <div className="org-col"><div className="org-box org-sub">শিক্ষক পরিষদ<br/><small>Faculty Council</small></div></div>
            <div className="org-col"><div className="org-box org-sub">প্রশাসন বিভাগ<br/><small>Administration</small></div></div>
          </div>
          <div className="org-vline"/>
          <div className="org-row-dept">
            {['বাংলা','ইংরেজি','গণিত','পদার্থ','রসায়ন','ইতিহাস','রাষ্ট্রবিজ্ঞান','সমাজকর্ম','গ্রন্থাগার'].map((d,i)=>(
              <div key={i} className="org-dept">{d}</div>
            ))}
          </div>
        </div>
      </div>
      <Section title="বিভাগসমূহ">
        <ul>
          <li>বাংলা বিভাগ — HSC ও স্নাতক (সম্মান)</li>
          <li>ইংরেজি বিভাগ — HSC ও স্নাতক (সম্মান)</li>
          <li>গণিত বিভাগ — HSC</li>
          <li>পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান — HSC</li>
          <li>ইতিহাস, অর্থনীতি, ভূগোল — মানবিক শাখা</li>
          <li>হিসাববিজ্ঞান, ব্যবস্থাপনা — বাণিজ্য শাখা</li>
          <li>রাষ্ট্রবিজ্ঞান, সমাজকর্ম — স্নাতক (সম্মান)</li>
          <li>কেন্দ্রীয় গ্রন্থাগার</li>
        </ul>
      </Section>
    </ContentPageShell>
  );
}