import React from 'react';
import ContentPageShell, { Section, InfoBox } from './ContentPageShell';
export default function ResultDegree() {
  return (
    <ContentPageShell title="Degree Honours Result" banglaTitle="স্নাতক সম্মান ফলাফল" icon="📊"
      breadcrumb={[{label:'ফলাফল',path:'/result'}]}>
      <Section title="স্নাতক সম্মান ফলাফল">
        <p>মালখানগর কলেজ শিক্ষার্থীদের পরীক্ষার ফলাফল সংক্রান্ত বিস্তারিত নির্দেশনা নিচে দেওয়া হলো।</p>
      </Section>
      <InfoBox title="ফলাফল দেখার নির্দেশনা" items={['www.nu.ac.bd/results — রোল ও নিবন্ধন নম্বর দিয়ে দেখুন','সনদপত্র বিতরণ বিজ্ঞপ্তি দেখুন','বিস্তারিত জানতে কলেজ অফিসে যোগাযোগ করুন']} />
    </ContentPageShell>
  );
}