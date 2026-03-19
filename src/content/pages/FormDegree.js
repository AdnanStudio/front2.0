import React from 'react';
import ContentPageShell, { Section, InfoBox, Alert } from './ContentPageShell';
import { Link } from 'react-router-dom';
export default function FormDegree() {
  return (
    <ContentPageShell title="Form Fill-Up" banglaTitle="স্নাতক সম্মান ফর্ম পূরণ" icon="📝"
      breadcrumb={[{label:'ফর্ম ফিলাপ',path:'/form'}]}>
      <Alert type="warning">⚠️ সর্বশেষ তথ্যের জন্য নোটিশ বোর্ড দেখুন। নির্ধারিত সময়সীমা মেনে চলুন।</Alert>
      <Section title="স্নাতক সম্মান ফর্ম পূরণ — নির্দেশাবলি">
        <p>নির্ধারিত সময়সীমার মধ্যে ফর্ম পূরণ সম্পন্ন করতে হবে। নিচের ধাপগুলো অনুসরণ করুন।</p>
      </Section>
      <InfoBox title="ফর্ম পূরণের ধাপসমূহ" items={['www.nu.ac.bd/admissions এ লগইন করুন','নির্ধারিত ফি অনলাইনে পরিশোধ করুন','ফর্ম প্রিন্ট করে কলেজে জমা দিন','কলেজ থেকে সিল ও স্বাক্ষর নিন']} />
      <div style={{textAlign:'center',marginTop:16}}>
        <Link to="/notices" style={{display:'inline-block',background:'#2e7d32',color:'#fff',padding:'10px 24px',borderRadius:20,fontWeight:700,textDecoration:'none',fontFamily:"'Hind Siliguri',sans-serif",fontSize:14}}>📢 নোটিশ বোর্ড</Link>
      </div>
    </ContentPageShell>
  );
}