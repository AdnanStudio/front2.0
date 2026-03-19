import React from 'react';
import ContentPageShell, { Section, InfoBox, CardGrid } from './ContentPageShell';
export default function EasyCollegeMate() {
  return (
    <ContentPageShell title="EasyCollegeMate" banglaTitle="ইজি কলেজমেট" icon="💡" breadcrumb={[]}>
      <Section title="EasyCollegeMate — স্মার্ট শিক্ষা ব্যবস্থাপনা">
        <p>EasyCollegeMate হলো মালখানগর কলেজের ডিজিটাল শিক্ষা ব্যবস্থাপনা সিস্টেম। শিক্ষার্থী, শিক্ষক ও অভিভাবকরা সহজেই কলেজের সকল তথ্য পাবেন।</p>
      </Section>
      <CardGrid cards={[
        {icon:'📅',title:'ক্লাস রুটিন',text:'অনলাইনে ক্লাস রুটিন দেখুন ও ডাউনলোড করুন।',color:'#1565c0'},
        {icon:'📊',title:'পরীক্ষার ফলাফল',text:'তাৎক্ষণিকভাবে পরীক্ষার ফলাফল জানুন।',color:'#2e7d32'},
        {icon:'🪪',title:'ডিজিটাল এডমিট',text:'ডিজিটাল এডমিট কার্ড ডাউনলোড করুন।',color:'#c62828'},
        {icon:'🔔',title:'তাৎক্ষণিক নোটিশ',text:'নোটিশ ও সার্কুলার তাৎক্ষণিক পান।',color:'#e65100'},
        {icon:'💳',title:'অনলাইন পেমেন্ট',text:'অনলাইনে ফি পরিশোধের সুবিধা।',color:'#4527a0'},
        {icon:'📱',title:'মোবাইল অ্যাপ',text:'যেকোনো ডিভাইস থেকে অ্যাক্সেস করুন।',color:'#00695c'},
      ]} />
      <InfoBox title="কীভাবে শুরু করবেন" items={[
        'কলেজ অফিস থেকে লগইন তথ্য সংগ্রহ করুন',
        'নির্ধারিত ওয়েবসাইটে ইউজার আইডি ও পাসওয়ার্ড দিয়ে লগইন করুন',
        'মোবাইল বা কম্পিউটার থেকে ব্যবহার করুন',
        'বিস্তারিত জানতে কলেজ আইটি বিভাগে যোগাযোগ করুন',
      ]} />
    </ContentPageShell>
  );
}