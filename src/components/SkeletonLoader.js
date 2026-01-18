import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'text', count = 1, height, width }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="skeleton-text-wrapper">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="skeleton-text" style={{ width: width || '100%' }}></div>
            ))}
          </div>
        );
      
      case 'title':
        return <div className="skeleton-title" style={{ width: width || '60%' }}></div>;
      
      case 'image':
        return (
          <div 
            className="skeleton-image" 
            style={{ 
              height: height || '200px',
              width: width || '100%'
            }}
          ></div>
        );
      
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image" style={{ height: '200px' }}></div>
            <div className="skeleton-card-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text" style={{ width: '80%' }}></div>
            </div>
          </div>
        );
      
      // ✅ ADDED: table type
      case 'table':
        return (
          <div className="skeleton-table">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell"></div>
              </div>
            ))}
          </div>
        );
      
      case 'table-row':
        return (
          <div className="skeleton-table-row">
            {[...Array(count || 4)].map((_, i) => (
              <div key={i} className="skeleton-table-cell"></div>
            ))}
          </div>
        );
      
      // ✅ ADDED: form type
      case 'form':
        return (
          <div className="skeleton-form">
            <div className="skeleton-input"></div>
            <div className="skeleton-input"></div>
            <div className="skeleton-textarea"></div>
          </div>
        );
      
      default:
        return <div className="skeleton-block" style={{ height, width }}></div>;
    }
  };

  return <div className="skeleton-loader">{renderSkeleton()}</div>;
};

export default SkeletonLoader;


// import React from 'react';
// import './SkeletonLoader.css';

// const SkeletonLoader = ({ type = 'text', count = 1, height, width }) => {
//   const renderSkeleton = () => {
//     switch (type) {
//       case 'text':
//         return (
//           <div className="skeleton-text-wrapper">
//             {[...Array(count)].map((_, i) => (
//               <div key={i} className="skeleton-text" style={{ width: width || '100%' }}></div>
//             ))}
//           </div>
//         );
      
//       case 'title':
//         return <div className="skeleton-title" style={{ width: width || '60%' }}></div>;
      
//       case 'image':
//         return (
//           <div 
//             className="skeleton-image" 
//             style={{ 
//               height: height || '200px',
//               width: width || '100%'
//             }}
//           ></div>
//         );
      
//       case 'card':
//         return (
//           <div className="skeleton-card">
//             <div className="skeleton-image" style={{ height: '200px' }}></div>
//             <div className="skeleton-card-content">
//               <div className="skeleton-title"></div>
//               <div className="skeleton-text"></div>
//               <div className="skeleton-text" style={{ width: '80%' }}></div>
//             </div>
//           </div>
//         );
      
//       case 'table-row':
//         return (
//           <div className="skeleton-table-row">
//             {[...Array(count || 4)].map((_, i) => (
//               <div key={i} className="skeleton-table-cell"></div>
//             ))}
//           </div>
//         );
      
//       default:
//         return <div className="skeleton-block" style={{ height, width }}></div>;
//     }
//   };

//   return <div className="skeleton-loader">{renderSkeleton()}</div>;
// };

// export default SkeletonLoader;