import React from 'react';
import ContentPageShell, { Section, InfoBox, Alert } from './ContentPageShell';
export default function AdmissionDegreePass() {
  return (
    <ContentPageShell title="Degree Pass Admission" banglaTitle="স্নাতক পাস ভর্তি" icon="📚"
      breadcrumb={[{label:'এডমিশন',path:'/admission'}]}>
      <Alert type="info">ℹ️ জাতীয় বিশ্ববিদ্যালয়ের কেন্দ্রীয় নীতিমালা অনুযায়ী ভর্তি পরিচালিত হয়।</Alert>
      <Section title="স্নাতক (পাস) ভর্তি">
        <p>মালখানগর কলেজে জাতীয় বিশ্ববিদ্যালয়ের অধীনে স্নাতক (পাস) কোর্সে ভর্তির আবেদন গ্রহণ করা হচ্ছে। www.nu.ac.bd ওয়েবসাইটে অনলাইনে আবেদন করতে হবে।</p>
      </Section>
      <InfoBox title="ভর্তির যোগ্যতা" items={[
        'HSC বা সমমান পরীক্ষায় ন্যূনতম জিপিএ ২.০০',
        'পুরনো সার্টিফিকেটধারীরাও আবেদন করতে পারবেন',
        'মেধাক্রম অনুযায়ী নির্ধারিত আসনে ভর্তি',
        'বিস্তারিত: www.nu.ac.bd',
      ]} />
      <InfoBox color="#e65100" title="প্রয়োজনীয় কাগজপত্র" items={[
        'HSC ও SSC মূল সার্টিফিকেট ও মার্কশিট',
        'অনলাইন জন্ম নিবন্ধন সনদ',
        'সদ্য তোলা রঙিন পাসপোর্ট সাইজ ছবি ৪ কপি',
        'নাগরিকত্ব/চারিত্রিক সনদ',
      ]} />
    </ContentPageShell>
  );
}