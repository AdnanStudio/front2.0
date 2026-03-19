import React, { useState, useEffect } from 'react';
import ContentPageShell, { Section } from './ContentPageShell';
const API = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';
export default function PrincipalPage() {
  const [img,  setImg]  = useState('/sir.jpg');
  const [name, setName] = useState('অধ্যক্ষ (ভারপ্রাপ্ত)');
  const [desig,setDesig]= useState('অধ্যক্ষ, মালখানগর কলেজ');
  useEffect(()=>{
    fetch(`${API}/settings`).then(r=>r.json()).then(d=>{
      if(d.success&&d.data?.chairmanImage?.url) setImg(d.data.chairmanImage.url);
    }).catch(()=>{});
    fetch(`${API}/public/home`).then(r=>r.json()).then(d=>{
      if(d.success&&d.data?.principalInfo){
        if(d.data.principalInfo.name) setName(d.data.principalInfo.name);
        if(d.data.principalInfo.designation) setDesig(d.data.principalInfo.designation);
      }
    }).catch(()=>{});
  },[]);
  return (
    <ContentPageShell title="Principal's Message" banglaTitle="অধ্যক্ষের বাণী" icon="🎓"
      breadcrumb={[{label:'প্রতিষ্ঠান পরিচিতি',path:'/about'}]}>
      <div style={{background:'#fff',borderRadius:10,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.08)',marginBottom:16,display:'flex',gap:24,flexWrap:'wrap'}}>
        <div style={{flexShrink:0,textAlign:'center'}}>
          <img src={img} alt="অধ্যক্ষ"
            style={{width:180,height:220,objectFit:'cover',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,.15)',border:'3px solid #c8e6c9',display:'block'}}
            onError={e=>e.target.src='/sir.jpg'} />
          <p style={{marginTop:10,fontWeight:700,color:'#1b5e20',fontFamily:"'Hind Siliguri',sans-serif",fontSize:14,margin:'10px 0 2px'}}>{name}</p>
          <p style={{margin:0,color:'#666',fontFamily:"'Hind Siliguri',sans-serif",fontSize:13}}>{desig}</p>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <h3 style={{color:'#1b5e20',fontFamily:"'Hind Siliguri',sans-serif",marginTop:0,fontSize:18}}>অধ্যক্ষের বাণী</h3>
          <p style={{fontFamily:"'Hind Siliguri',sans-serif",lineHeight:1.9,color:'#333',fontSize:15,marginBottom:14}}>
            ❝ মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি অগ্রসরমান প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ।
          </p>
          <p style={{fontFamily:"'Hind Siliguri',sans-serif",lineHeight:1.9,color:'#333',fontSize:15,marginBottom:14}}>
            প্রিয় শিক্ষার্থীরা — স্বপ্ন দেখো, কঠোর পরিশ্রম করো এবং নৈতিকতার সাথে এগিয়ে চলো। তোমাদের প্রতিটি সাফল্যই মালখানগর কলেজের গর্ব। ❞
          </p>
          <p style={{fontFamily:"'Hind Siliguri',sans-serif",lineHeight:1.9,color:'#555',fontSize:14}}>
            ১৯৯২ সাল থেকে মালখানগর কলেজ এই অঞ্চলের হাজার হাজার শিক্ষার্থীর স্বপ্ন পূরণে নিরলস কাজ করে যাচ্ছে।
          </p>
        </div>
      </div>
      <Section title="কলেজের লক্ষ্য ও উদ্দেশ্য">
        <ul>
          <li>গ্রামীণ শিক্ষার্থীদের জন্য মানসম্মত উচ্চশিক্ষা নিশ্চিত করা</li>
          <li>আধুনিক প্রযুক্তি ও বিজ্ঞান শিক্ষায় অগ্রগতি অর্জন</li>
          <li>নৈতিক মূল্যবোধ ও দেশপ্রেম তৈরি</li>
          <li>সামগ্রিক ব্যক্তিত্ব বিকাশ ও সহশিক্ষা কার্যক্রম</li>
          <li>ডিজিটাল শিক্ষা পদ্ধতির সম্পূর্ণ বাস্তবায়ন</li>
        </ul>
      </Section>
    </ContentPageShell>
  );
}