import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { BookOpen, Computer, FlaskConical, Home, Wifi, Users } from 'lucide-react';
import './AboutPages.css';

const Facilities = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="content-page-wrapper">
        <div className="container">
          <SkeletonLoader type="title" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Our Facilities</h1>
          <div className="title-underline"></div>
          <p className="page-subtitle">
          </p>
        </div>

        <div className="content-body">
          <div className="facilities-grid-main">
            <div className="facility-card-main">
              <div className="facility-icon-main">
                <Home size={40} />
              </div>
              <h3>আধুনিক ভবন</h3>
              <p>
                চার তলা বিশিষ্ট আধুনিক একাডেমিক ভবন যেখানে ২৫টি প্রশস্ত ও সুসজ্জিত শ্রেণিকক্ষ রয়েছে। প্রতিটি শ্রেণিকক্ষে পর্যাপ্ত আলো-বাতাস এবং আসন ব্যবস্থা রয়েছে।
              </p>
              <ul className="facility-features">
                <li>✓ ২৫টি শ্রেণিকক্ষ</li>
                <li>✓ প্রশস্ত করিডোর</li>
                <li>✓ জরুরি বহির্গমন পথ</li>
                <li>✓ প্রতিবন্ধীবান্ধব সুবিধা</li>
              </ul>
            </div>

            <div className="facility-card-main">
              <div className="facility-icon-main">
                <BookOpen size={40} />
              </div>
              <h3>সমৃদ্ধ গ্রন্থাগার</h3>
              <p>
                একটি সুবিশাল গ্রন্থাগার যেখানে ৫,০০০+ বই, জার্নাল, ম্যাগাজিন এবং রেফারেন্স বই রয়েছে। শীতাতপ নিয়ন্ত্রিত পড়ার জন্য শান্ত পরিবেশ।
              </p>
              <ul className="facility-features">
                <li>✓ ৫,০০০+ বই সংগ্রহ</li>
                <li>✓ ১০০+ পত্রিকা ও জার্নাল</li>
                <li>✓ ডিজিটাল লাইব্রেরি</li>
                <li>✓ ১৫০ জন বসার ব্যবস্থা</li>
              </ul>
            </div>

            <div className="facility-card-main">
              <div className="facility-icon-main">
                <Computer size={40} />
              </div>
              <h3>কম্পিউটার ল্যাব</h3>
              <p>
                দুটি আধুনিক কম্পিউটার ল্যাব যেখানে ৫০টি কম্পিউটার রয়েছে। হাই-স্পিড ইন্টারনেট সংযোগসহ সর্বশেষ সফটওয়্যার ইনস্টল করা।
              </p>
              <ul className="facility-features">
                <li>✓ ৫০টি আধুনিক কম্পিউটার</li>
                <li>✓ হাই-স্পিড ইন্টারনেট</li>
                <li>✓ মাল্টিমিডিয়া সুবিধা</li>
                <li>✓ প্রশিক্ষিত ল্যাব সহকারী</li>
              </ul>
            </div>

            <div className="facility-card-main">
              <div className="facility-icon-main">
                <FlaskConical size={40} />
              </div>
              <h3>বিজ্ঞান ল্যাবরেটরি</h3>
              <p>
                পদার্থবিজ্ঞান, রসায়ন এবং জীববিজ্ঞান ল্যাবরেটরি যেখানে ছাত্র-ছাত্রীরা বাস্তব পরীক্ষা-নিরীক্ষা করার সুযোগ পায়।
              </p>
              <ul className="facility-features">
                <li>✓ পদার্থবিজ্ঞান ল্যাব</li>
                <li>✓ রসায়ন ল্যাব</li>
                <li>✓ জীববিজ্ঞান ল্যাব</li>
                <li>✓ আধুনিক যন্ত্রপাতি</li>
              </ul>
            </div>

            <div className="facility-card-main">
              <div className="facility-icon-main">
                <Wifi size={40} />
              </div>
              <h3>ওয়াই-ফাই ক্যাম্পাস</h3>
              <p>
                সম্পূর্ণ ক্যাম্পাসে ফ্রি ওয়াই-ফাই সুবিধা। শিক্ষার্থীরা যেকোনো স্থান থেকে অনলাইন রিসোর্স ব্যবহার করতে পারে।
              </p>
              <ul className="facility-features">
                <li>✓ সম্পূর্ণ ক্যাম্পাস কভারেজ</li>
                <li>✓ হাই-স্পিড সংযোগ</li>
                <li>✓ নিরাপদ নেটওয়ার্ক</li>
                <li>✓ ২৪/৭ সেবা</li>
              </ul>
            </div>

            <div className="facility-card-main">
              <div className="facility-icon-main">
                <Users size={40} />
              </div>
              <h3>সেমিনার হল</h3>
              <p>
                একটি আধুনিক সেমিনার হল যেখানে ৩০০ জন বসার ব্যবস্থা রয়েছে। মাল্টিমিডিয়া প্রজেক্টর এবং সাউন্ড সিস্টেম সজ্জিত।
              </p>
              <ul className="facility-features">
                <li>✓ ৩০০ আসন বিশিষ্ট</li>
                <li>✓ এসি সুবিধা</li>
                <li>✓ মাল্টিমিডিয়া সিস্টেম</li>
                <li>✓ উন্নত সাউন্ড সিস্টেম</li>
              </ul>
            </div>
          </div>

          <div className="additional-facilities">
            <h2>অন্যান্য সুবিধাসমূহ</h2>
            <div className="facilities-two-column">
              <div className="facility-list-item">
                <span className="facility-icon-small">⚽</span>
                <div>
                  <h4>খেলার মাঠ</h4>
                  <p>ফুটবল, ক্রিকেট এবং অন্যান্য খেলার জন্য প্রশস্ত মাঠ</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🍽️</span>
                <div>
                  <h4>ক্যান্টিন</h4>
                  <p>স্বাস্থ্যকর ও সাশ্রয়ী মূল্যের খাবার সরবরাহ</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🚌</span>
                <div>
                  <h4>পরিবহন সুবিধা</h4>
                  <p>শিক্ষার্থী ও শিক্ষকদের জন্য বাস সুবিধা</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🏥</span>
                <div>
                  <h4>প্রাথমিক চিকিৎসা</h4>
                  <p>জরুরি চিকিৎসা সেবা এবং মেডিকেল রুম</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🔒</span>
                <div>
                  <h4>নিরাপত্তা ব্যবস্থা</h4>
                  <p>২৪/৭ নিরাপত্তা এবং সিসি ক্যামেরা নজরদারি</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🚰</span>
                <div>
                  <h4>বিশুদ্ধ পানি</h4>
                  <p>ফিল্টার করা পানির ব্যবস্থা সম্পূর্ণ ক্যাম্পাসে</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🚻</span>
                <div>
                  <h4>টয়লেট সুবিধা</h4>
                  <p>পরিচ্ছন্ন এবং পৃথক ছেলে-মেয়েদের টয়লেট</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🔌</span>
                <div>
                  <h4>ইলেকট্রিক ব্যাকআপ</h4>
                  <p>জেনারেটর এবং IPS ব্যাকআপ ব্যবস্থা</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">📢</span>
                <div>
                  <h4>অডিটোরিয়াম</h4>
                  <p>সাংস্কৃতিক অনুষ্ঠান এবং সভার জন্য হল</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🎨</span>
                <div>
                  <h4>কমন রুম</h4>
                  <p>শিক্ষার্থীদের বিশ্রাম ও আলোচনার জায়গা</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🕋</span>
                <div>
                  <h4>নামাজ কক্ষ</h4>
                  <p>ছেলে-মেয়েদের জন্য পৃথক নামাজের ব্যবস্থা</p>
                </div>
              </div>

              <div className="facility-list-item">
                <span className="facility-icon-small">🅿️</span>
                <div>
                  <h4>পার্কিং সুবিধা</h4>
                  <p>শিক্ষক এবং শিক্ষার্থীদের জন্য পার্কিং এরিয়া</p>
                </div>
              </div>
            </div>
          </div>

          <div className="future-plans">
            <h2>আগামীর পরিকল্পনা</h2>
            <p>
              মালখানগর কলেজ ভবিষ্যতে আরও উন্নত সুবিধা যোগ করার পরিকল্পনা করছে। আমরা একটি নতুন অত্যাধুনিক ল্যাবরেটরি, বর্ধিত গ্রন্থাগার, একটি জিমনেসিয়াম এবং একটি হোস্টেল নির্মাণের পরিকল্পনা করছি। এছাড়াও, আমরা সৌর শক্তি ব্যবহার করে একটি সবুজ ক্যাম্পাস তৈরি করতে চাই যা পরিবেশ বান্ধব হবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facilities;


// import React, { useState, useEffect } from 'react';
// import SkeletonLoader from '../../components/SkeletonLoader';
// import '../ContentPages.css';

// const Facilities = () => {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 800);
//     window.scrollTo(0, 0);
//   }, []);

//   if (loading) {
//     return (
//       <div className="content-page-wrapper">
//         <div className="container">
//           <SkeletonLoader type="title" />
//           <SkeletonLoader type="card" />
//           <SkeletonLoader type="card" />
//           <SkeletonLoader type="card" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="content-page-wrapper">
//       <div className="container">
//         <div className="page-header">
//           <h1>Facilities</h1>
//           <div className="title-underline"></div>
//         </div>

//         <div className="content-body">
//           <div className="content-section">
//             <p>
//               {/* Content will be added later */}
//               Facilities content will be added here...
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Facilities;