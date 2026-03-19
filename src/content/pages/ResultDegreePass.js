import React from 'react';
import ContentPageShell, { Section, InfoBox } from './ContentPageShell';
export default function ResultDegreePass() {
  return (
    <ContentPageShell title="Degree Pass Result" banglaTitle="স্নাতক পাস ফলাফল" icon="📊"
      breadcrumb={[{label:'ফলাফল',path:'/result'}]}>
      <Section title="স্নাতক পাস ফলাফল">
        <p>মালখানগর কলেজ শিক্ষার্থীদের পরীক্ষার ফলাফল সংক্রান্ত বিস্তারিত নির্দেশনা নিচে দেওয়া হলো।</p>
      </Section>
      <InfoBox title="ফলাফল দেখার নির্দেশনা" items={['www.nu.ac.bd/results — নিবন্ধন নম্বর দিয়ে দেখুন','মার্কশিট কলেজ অফিস থেকে সংগ্রহ করুন','সনদ বিতরণ বিষয়ক নোটিশ বোর্ড দেখুন']} />
    </ContentPageShell>
  );
}