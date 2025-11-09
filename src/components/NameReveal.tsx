import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

interface NameRevealProps {
  name: string;
  isRevealed: boolean;
}

const NameReveal: React.FC<NameRevealProps> = ({ name, isRevealed }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isRevealed) {
      setShowConfetti(true);
      // Keep the confetti going for longer
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isRevealed]);

  // Removed all animations for the name

  return (
    <div className="name-reveal-container" style={{ position: 'relative' }}>
      {showConfetti && (
        <>
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={500}
            recycle={true}
            tweenDuration={8000}
            gravity={0.2}
            initialVelocityX={15}
            initialVelocityY={20}
            colors={['#FFD700', '#00a86b', '#FF6B6B', '#4ECDC4', '#45B7D1']}
          />
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={200}
            recycle={true}
            tweenDuration={6000}
            gravity={0.1}
            initialVelocityX={-15}
            initialVelocityY={15}
            colors={['#FFD700', '#00a86b', '#FF6B6B', '#4ECDC4', '#45B7D1']}
          />
        </>
      )}
      <div>
        {isRevealed ? (
          <div
            className="name-revealed"
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#00a86b',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              position: 'relative',
              zIndex: 1
            }}
          >
            {name}
          </div>
        ) : (
          <div
            className="name-hidden"
            style={{
              fontSize: '3rem',
              color: '#666',
              padding: '2rem'
            }}
          >
            ?????
          </div>
        )}
      </div>
    </div>
  );
};

export default NameReveal;