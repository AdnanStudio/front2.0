import React from 'react';
import ContentPageShell, { Section, InfoBox } from './ContentPageShell';
export default function ResultHsc() {
  return (
    <ContentPageShell title="HSC Board Result" banglaTitle="উচ্চ মাধ্যমিক ফলাফল" icon="📊"
      breadcrumb={[{label:'ফলাফল',path:'/result'}]}>
      <Section title="উচ্চ মাধ্যমিক ফলাফল">
        <p>মালখানগর কলেজ শিক্ষার্থীদের পরীক্ষার ফলাফল সংক্রান্ত বিস্তারিত নির্দেশনা নিচে দেওয়া হলো।</p>
      </Section>
      <InfoBox title="ফলাফল দেখার নির্দেশনা" items={['ঢাকা বোর্ডের ওয়েবসাইট: www.dhakaeducationboard.gov.bd','SMS-এ: DHA<space>Roll<space>Year পাঠান 16222 নম্বরে','মার্কশিট কলেজ থেকে সংগ্রহ করুন','পুনর্মূল্যায়ন আবেদন: বোর্ড নির্ধারিত সময়ের মধ্যে']} />
    </ContentPageShell>
  );
}