import React from 'react';
import ContentPageShell, { Section, InfoBox, CpsTable, Alert } from './ContentPageShell';
import { Link } from 'react-router-dom';
export default function AdmissionHsc() {
  return (
    <ContentPageShell title="HSC Admission" banglaTitle="উচ্চ মাধ্যমিক ভর্তি" icon="📚"
      breadcrumb={[{label:'এডমিশন',path:'/admission'}]}>
      <Alert type="success">✅ ২০২৫-২০২৬ শিক্ষাবর্ষে একাদশ শ্রেণিতে ভর্তির আবেদন চলছে।</Alert>
      <Section title="একাদশ শ্রেণি ভর্তি — ২০২৫-২০২৬">
        <p>মালখানগর কলেজে ২০২৫-২০২৬ শিক্ষাবর্ষে একাদশ শ্রেণিতে তিনটি শাখায় ভর্তির আবেদন গ্রহণ চলছে।</p>
        <CpsTable
          headers={['শাখা','আসন','ন্যূনতম GPA','বিশেষ শর্ত']}
          rows={[
            ['বিজ্ঞান','৬০','৩.৫০','গণিত ও বিজ্ঞানে ন্যূনতম B'],
            ['মানবিক','১০০','২.৫০','—'],
            ['বাণিজ্য','৬০','২.৫০','—'],
          ]}
        />
      </Section>
      <InfoBox title="প্রয়োজনীয় কাগজপত্র" items={[
        'SSC পরীক্ষার মূল রেজিস্ট্রেশন কার্ড ও মার্কশিট',
        'অনলাইন জন্ম নিবন্ধন সনদ (সত্যায়িত কপি)',
        'পিতা/মাতার জাতীয় পরিচয়পত্রের ফটোকপি',
        'সদ্য তোলা ৩ কপি রঙিন পাসপোর্ট সাইজ ছবি',
        'TCX / Transfer Certificate',
      ]} />
      <InfoBox color="#e65100" title="আবেদনের পদ্ধতি" items={[
        'ঢাকা শিক্ষা বোর্ডের ওয়েবসাইটে অনলাইনে আবেদন করুন',
        'আবেদন ফি নগদ/বিকাশ/রকেট দিয়ে পরিশোধ করুন',
        'মেধাতালিকা প্রকাশের পর নির্ধারিত তারিখে ভর্তি নিশ্চিত করুন',
        'বিস্তারিত জানতে কলেজ অফিসে যোগাযোগ করুন',
      ]} />
      <div style={{textAlign:'center',marginTop:16,display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <Link to="/admission/apply" style={{display:'inline-block',background:'#2e7d32',color:'#fff',padding:'10px 24px',borderRadius:20,fontWeight:700,textDecoration:'none',fontFamily:"'Hind Siliguri',sans-serif"}}>অনলাইনে আবেদন →</Link>
        <Link to="/admission/requirements" style={{display:'inline-block',background:'#1565c0',color:'#fff',padding:'10px 24px',borderRadius:20,fontWeight:700,textDecoration:'none',fontFamily:"'Hind Siliguri',sans-serif"}}>ভর্তির শর্তাবলী</Link>
      </div>
    </ContentPageShell>
  );
}