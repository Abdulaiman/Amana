import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeMap = { sm: '16px', md: '24px', lg: '32px' };
  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        width: dim,
        height: dim,
        border: '2px solid var(--color-border)',
        borderTop: '2px solid var(--color-brand)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block'
      }}
    />
  );
};

export default Loader;
