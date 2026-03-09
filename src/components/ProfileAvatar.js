import React, { useState } from 'react';

// Name থেকে consistent color বের করে (same name → same color সবসময়)
const getAvatarColor = (name = '') => {
  const colors = [
    '#E53935', '#D81B60', '#8E24AA', '#5E35B1',
    '#1E88E5', '#00897B', '#43A047', '#FB8C00',
    '#F4511E', '#6D4C41', '#546E7A', '#00ACC1',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Name-এর প্রথম অক্ষর বের করে (বাংলা বা English দুটোই কাজ করবে)
const getInitial = (name = '') => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

// Placeholder URL হলে invalid ধরা হবে
const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url.includes('via.placeholder.com')) return false;
  if (url.includes('placeholder')) return false;
  return true;
};

/**
 * ProfileAvatar
 * @param {string}  image     - Cloudinary বা যেকোনো image URL
 * @param {string}  name      - ব্যক্তির নাম (fallback avatar এ initial দেখাবে)
 * @param {number}  size      - pixel size (default 40)
 * @param {string}  className - extra CSS class
 * @param {object}  style     - extra inline style
 */
const ProfileAvatar = ({ image, name = '', size = 40, className = '', style = {} }) => {
  const [imgError, setImgError] = useState(false);

  const showImage = isValidImageUrl(image) && !imgError;

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    ...style,
  };

  const avatarStyle = {
    ...baseStyle,
    background: getAvatarColor(name),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: size * 0.42,
    letterSpacing: '0.5px',
    userSelect: 'none',
  };

  if (showImage) {
    return (
      <img
        src={image}
        alt={name}
        className={className}
        style={baseStyle}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={className} style={avatarStyle} title={name}>
      {getInitial(name)}
    </div>
  );
};

export default ProfileAvatar;