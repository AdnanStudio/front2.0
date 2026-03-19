import React from 'react';
import ContentPageShell, { Section, InfoBox, CpsTable, Alert } from './ContentPageShell';
import { Link } from 'react-router-dom';
export default function HscRoutine() {
  return (
    <ContentPageShell title="HSC Class Routine" banglaTitle="উচ্চ মাধ্যমিক ক্লাস রুটিন" icon="📅"
      breadcrumb={[{label:'একাডেমিক',path:'/academic'}]}>
      <Alert type="info">📌 ২০২৫-২০২৬ শিক্ষাবর্ষ — সর্বশেষ রুটিনের জন্য নোটিশ বোর্ড দেখুন।</Alert>
      <Section title="একাদশ-দ্বাদশ শ্রেণি ক্লাস সময়সূচি">
        <p>মালখানগর কলেজের উচ্চ মাধ্যমিক বিভাগে প্রতিদিন ৭টি পিরিয়ডে ক্লাস পরিচালিত হয়। তিনটি শাখায় পৃথক রুটিন অনুসরণ করা হয়।</p>
        <CpsTable
          headers={['পিরিয়ড','সময়','বিজ্ঞান শাখা','মানবিক শাখা','বাণিজ্য শাখা']}
          rows={[
            ['১ম','৮:০০ — ৮:৪৫','পদার্থবিজ্ঞান','বাংলা','হিসাববিজ্ঞান'],
            ['২য়','৮:৪৫ — ৯:৩০','রসায়ন','ইংরেজি','ব্যবসায় নীতি'],
            ['৩য়','৯:৩০ — ১০:১৫','জীববিজ্ঞান / গণিত','ইতিহাস','ব্যবস্থাপনা'],
            ['বিরতি','১০:১৫ — ১০:৩০','—','—','—'],
            ['৪র্থ','১০:৩০ — ১১:১৫','উচ্চতর গণিত','পৌরনীতি','পরিসংখ্যান'],
            ['৫ম','১১:১৫ — ১২:০০','ইংরেজি','অর্থনীতি','ইংরেজি'],
            ['৬ষ্ঠ','১২:০০ — ১২:৪৫','বাংলা','ভূগোল','বাংলা'],
            ['৭ম','১২:৪৫ — ১:৩০','ICT','সমাজবিজ্ঞান','ICT'],
          ]}
        />
      </Section>
      <InfoBox title="গুরুত্বপূর্ণ তথ্য" items={[
        'শনিবার: সকাল ৮:০০ — দুপুর ১২:০০ (৪টি পিরিয়ড)',
        'শুক্রবার ও সরকারি ছুটিতে ক্লাস বন্ধ',
        'পরীক্ষার সপ্তাহে ক্লাস রুটিন পরিবর্তিত হবে',
        'বিস্তারিত রুটিনের জন্য কলেজ নোটিশ বোর্ড দেখুন',
      ]} />
      <div style={{textAlign:'center',marginTop:16}}>
        <Link to="/notices" style={{display:'inline-block',background:'#2e7d32',color:'#fff',padding:'10px 24px',borderRadius:20,fontWeight:700,textDecoration:'none',fontFamily:"'Hind Siliguri',sans-serif",fontSize:14}}>📢 নোটিশ বোর্ড দেখুন</Link>
      </div>
    </ContentPageShell>
  );
}