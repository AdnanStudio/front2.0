import React from 'react';
import ContentPageShell, { Section, InfoBox } from './ContentPageShell';
export default function ResultInternal() {
  return (
    <ContentPageShell title="Internal Exam Result" banglaTitle="অভ্যন্তরীণ ফলাফল" icon="📊"
      breadcrumb={[{label:'ফলাফল',path:'/result'}]}>
      <Section title="অভ্যন্তরীণ ফলাফল">
        <p>মালখানগর কলেজ শিক্ষার্থীদের পরীক্ষার ফলাফল সংক্রান্ত বিস্তারিত নির্দেশনা নিচে দেওয়া হলো।</p>
      </Section>
      <InfoBox title="ফলাফল দেখার নির্দেশনা" items={['ফলাফল প্রকাশের পর নোটিশ বোর্ডে জানানো হবে','মার্কশিট সংগ্রহ করুন পরীক্ষা বিভাগ থেকে','পুনর্মূল্যায়নের আবেদন ৭ কার্যদিবসের মধ্যে জমা দিন']} />
    </ContentPageShell>
  );
}