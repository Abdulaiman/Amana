import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeMap = { sm: '16px', md: '24px', lg: '32px' };
  const dim = sizeMap[size];
  
  return (
    <div style={{
      width: dim,
      height: dim,
      border: '2px solid var(--color-soft)',
      borderTop: '2px solid var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }} />
  );
};

export default Loader;
