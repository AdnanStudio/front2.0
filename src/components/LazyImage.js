// src/components/LazyImage.js
// Each image has its own skeleton shimmer that disappears when loaded.
// Only images are lazy — other components load normally.
import React, { useRef, useState, useEffect } from 'react';
import './LazyImage.css';

/**
 * LazyImage — lazy loads an image using IntersectionObserver.
 * Shows a shimmer skeleton until the image fully loads.
 *
 * @param {string}  src        — image source URL
 * @param {string}  alt        — alt text
 * @param {string}  className  — CSS class for the <img>
 * @param {number}  threshold  — IntersectionObserver threshold (default 0.15)
 * @param {string}  style      — inline styles for the wrapper
 * @param {string}  wrapperClass — extra class for the skeleton wrapper div
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  threshold = 0.15,
  style = {},
  wrapperClass = '',
  ...rest
}) {
  const containerRef = useRef(null);
  const [visible,  setVisible]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const [errored,  setErrored]  = useState(false);

  // Start observing when component mounts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If threshold === 0 load immediately (hero images above the fold)
    if (threshold === 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  // Reset loaded state if src changes
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  const showSkeleton = !loaded && !errored;

  return (
    <div
      ref={containerRef}
      className={`li-wrap ${wrapperClass}`}
      style={style}
    >
      {/* Skeleton shimmer — shown until image loads */}
      {showSkeleton && (
        <div className="li-skeleton" aria-hidden="true" />
      )}

      {/* Actual image — only requested when visible */}
      {visible && src && (
        <img
          src={src}
          alt={alt}
          className={`li-img ${className} ${loaded ? 'li-loaded' : 'li-loading'}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setErrored(true); }}
          {...rest}
        />
      )}

      {/* Fallback icon for errored images */}
      {errored && (
        <div className="li-error" aria-label={alt}>
          <span>🖼️</span>
        </div>
      )}
    </div>
  );
}

// import React, { useState, useEffect, useRef } from 'react';
// import './LazyImage.css';

// const LazyImage = ({ 
//   src, 
//   alt, 
//   className = '', 
//   style = {},
//   placeholderType = 'skeleton' // 'skeleton', 'blur', or 'spinner'
// }) => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [isInView, setIsInView] = useState(false);
//   const [error, setError] = useState(false);
//   const imgRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsInView(true);
//             observer.disconnect();
//           }
//         });
//       },
//       {
//         rootMargin: '50px',
//         threshold: 0.01
//       }
//     );

//     if (imgRef.current) {
//       observer.observe(imgRef.current);
//     }

//     return () => {
//       if (observer) {
//         observer.disconnect();
//       }
//     };
//   }, []);

//   const handleLoad = () => {
//     setIsLoaded(true);
//   };

//   const handleError = () => {
//     setError(true);
//     setIsLoaded(true);
//   };

//   const getPlaceholder = () => {
//     if (placeholderType === 'spinner') {
//       return (
//         <div className="lazy-image-placeholder spinner-placeholder">
//           <div className="spinner-loader">
//             <div className="spinner-ring"></div>
//           </div>
//         </div>
//       );
//     }

//     if (placeholderType === 'blur') {
//       return (
//         <div className="lazy-image-placeholder blur-placeholder">
//           <div className="blur-box"></div>
//         </div>
//       );
//     }

//     // Default skeleton
//     return (
//       <div className="lazy-image-placeholder skeleton-placeholder">
//         <div className="skeleton-shimmer"></div>
//       </div>
//     );
//   };

//   return (
//     <div 
//       ref={imgRef} 
//       className={`lazy-image-wrapper ${className}`}
//       style={style}
//     >
//       {!isLoaded && !error && getPlaceholder()}
      
//       {isInView && (
//         <img
//           src={error ? 'https://via.placeholder.com/800x600?text=Image+Not+Found' : src}
//           alt={alt}
//           className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
//           onLoad={handleLoad}
//           onError={handleError}
//           loading="lazy"
//         />
//       )}
//     </div>
//   );
// };

// export default LazyImage;