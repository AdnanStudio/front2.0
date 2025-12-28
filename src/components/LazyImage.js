import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {},
  placeholderType = 'skeleton' // 'skeleton', 'blur', or 'spinner'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  const getPlaceholder = () => {
    if (placeholderType === 'spinner') {
      return (
        <div className="lazy-image-placeholder spinner-placeholder">
          <div className="spinner-loader">
            <div className="spinner-ring"></div>
          </div>
        </div>
      );
    }

    if (placeholderType === 'blur') {
      return (
        <div className="lazy-image-placeholder blur-placeholder">
          <div className="blur-box"></div>
        </div>
      );
    }

    // Default skeleton
    return (
      <div className="lazy-image-placeholder skeleton-placeholder">
        <div className="skeleton-shimmer"></div>
      </div>
    );
  };

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-wrapper ${className}`}
      style={style}
    >
      {!isLoaded && !error && getPlaceholder()}
      
      {isInView && (
        <img
          src={error ? 'https://via.placeholder.com/800x600?text=Image+Not+Found' : src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;