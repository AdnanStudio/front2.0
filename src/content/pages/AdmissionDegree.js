import React from 'react';
import ContentPageShell, { Section, InfoBox, Alert } from './ContentPageShell';
export default function AdmissionDegree() {
  return (
    <ContentPageShell title="Degree Honours Admission" banglaTitle="স্নাতক সম্মান ভর্তি" icon="📚"
      breadcrumb={[{label:'এডমিশন',path:'/admission'}]}>
      <Alert type="info">ℹ️ জাতীয় বিশ্ববিদ্যালয়ের ভর্তি বিজ্ঞপ্তি অনুসরণ করুন।</Alert>
      <Section title="স্নাতক (সম্মান) ভর্তি">
        <p>মালখানগর কলেজে জাতীয় বিশ্ববিদ্যালয়ের অধীনে স্নাতক (সম্মান) কোর্সে ভর্তির আবেদন গ্রহণ করা হচ্ছে।</p>
      </Section>
      <InfoBox title="উপলব্ধ বিষয় ও আসন" items={[
        'বাংলা সম্মান — আসন ৫০','ইংরেজি সম্মান — আসন ৫০',
        'ইসলামের ইতিহাস ও সংস্কৃতি — আসন ৫০',
        'রাষ্ট্রবিজ্ঞান সম্মান — আসন ৫০','সমাজকর্ম সম্মান — আসন ৫০',
      ]} />
      <InfoBox color="#e65100" title="ভর্তির যোগ্যতা" items={[
        'HSC বা সমমানে ন্যূনতম জিপিএ ২.৫০',
        'বিষয়ভেদে অতিরিক্ত শর্ত প্রযোজ্য হতে পারে',
        'মেধাক্রম অনুযায়ী ভর্তির সুযোগ — www.nu.ac.bd',
      ]} />
    </ContentPageShell>
  );
}