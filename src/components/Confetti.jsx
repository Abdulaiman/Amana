import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Confetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#0B5B5B', '#D4A247', '#E24B4B', '#10B981', '#3B82F6'];
    const newPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      animationDuration: Math.random() * 2 + 2 + 's',
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: Math.random() * 2 + 's'
    }));
    setPieces(newPieces);
  }, []);

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '0', zIndex: 9999, pointerEvents: 'none' }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            backgroundColor: p.backgroundColor,
            animationDelay: p.animationDelay,
            position: 'absolute',
            top: '-10px',
            width: '10px',
            height: '10px'
          }}
        />
      ))}
    </div>,
    document.body
  );
};

export default Confetti;
