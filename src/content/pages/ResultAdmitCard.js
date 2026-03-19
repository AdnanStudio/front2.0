import React from 'react';
import ContentPageShell, { Section, InfoBox } from './ContentPageShell';
export default function ResultAdmitCard() {
  return (
    <ContentPageShell title="Admit Card" banglaTitle="অভ্যন্তরীণ এডমিট কার্ড" icon="📊"
      breadcrumb={[{label:'ফলাফল',path:'/result'}]}>
      <Section title="অভ্যন্তরীণ এডমিট কার্ড">
        <p>মালখানগর কলেজ শিক্ষার্থীদের পরীক্ষার ফলাফল সংক্রান্ত বিস্তারিত নির্দেশনা নিচে দেওয়া হলো।</p>
      </Section>
      <InfoBox title="ফলাফল দেখার নির্দেশনা" items={['পরীক্ষার ১ সপ্তাহ আগে বিতরণ শুরু হয়','কলেজ পরীক্ষা বিভাগ থেকে পরিচয়পত্র দেখিয়ে সংগ্রহ করুন','ছবি ও বিষয় সঠিক কিনা যাচাই করুন','হারিয়ে গেলে পরীক্ষা বিভাগে অবিলম্বে জানান','পরীক্ষার হলে এডমিট কার্ড ছাড়া প্রবেশ নিষেধ']} />
    </ContentPageShell>
  );
}