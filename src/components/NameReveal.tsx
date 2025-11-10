import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import './NameReveal.css';
import './Theater.css';
import './StageEffects.css';

interface NameRevealProps {
  name: string;
  isRevealed: boolean;
  guestCount: number;
  onReveal: () => void;
}

const NameReveal: React.FC<NameRevealProps> = ({ name, isRevealed, guestCount, onReveal }) => {
  const REQUIRED_GUESTS = 5;
  const remainingGuests = Math.max(0, REQUIRED_GUESTS - guestCount);
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

  const generateFloatingElements = (count: number) => {
    const elements = ['circle', 'ring', 'star'];
    return Array.from({ length: count }, (_, i) => {
      const elementType = elements[i % elements.length];
      return (
        <div
          key={`float-${i}`}
          className={`floating-element floating-${elementType}`}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            bottom: `${Math.random() * 40 + 30}%`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      );
    });
  };

  const generateGlowLines = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={`glow-${i}`}
        className="glow-line"
        style={{
          width: `${Math.random() * 100 + 50}px`,
          left: `${Math.random() * 80 + 10}%`,
          bottom: `${Math.random() * 40 + 20}%`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ));
  };

  const generateRipples = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={`ripple-${i}`}
        className="ripple"
        style={{
          width: `${40 + i * 10}px`,
          height: `${40 + i * 10}px`,
          left: '50%',
          bottom: '30%',
          transform: 'translate(-50%, 50%)',
          animationDelay: `${i * 0.5}s`
        }}
      />
    ));
  };

  const generateSmokeParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="smoke-particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ));
  };

  return (
    <div className="name-reveal-container" style={{ 
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '400px',
        background: '#000'
      }}>
      <div className="theater-environment">
        {/* Stage lighting effect */}
        <div className="stage-lighting" />
        
        {/* Spotlights */}
        <div className={`spotlight left ${isRevealed ? 'active' : ''}`} />
        <div className={`spotlight right ${isRevealed ? 'active' : ''}`} />
        
        {/* Side curtains */}
        <div className="side-curtain left" />
        <div className="side-curtain right" />
        
        {/* Stage floor */}
        <div className="stage-floor" />
        
        {/* Smoke effects */}
        {isRevealed && generateSmokeParticles(10)}
        
        {/* Floating elements and effects */}
        {isRevealed && generateFloatingElements(12)}
        {isRevealed && generateGlowLines(8)}
        {isRevealed && generateRipples(3)}

        {/* Decorative stage platform */}
        <div className="stage-platform">
          <div className="platform-top" />
          <div className="platform-front" />
        </div>
      </div>

      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}>
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
            style={{ position: 'fixed', top: 0, left: 0 }}
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
            style={{ position: 'fixed', top: 0, left: 0 }}
          />
        </div>
      )}
      
      <div className="name-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: isRevealed ? '#00a86b' : '#666',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              background: isRevealed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              backdropFilter: isRevealed ? 'blur(10px)' : 'none',
              boxShadow: isRevealed ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 'none',
              border: isRevealed ? '1px solid rgba(255, 255, 255, 0.18)' : 'none',
              position: 'relative',
              zIndex: 1
            }}
          >
            {isRevealed ? name : '?????'}
          </div>
          
          {!isRevealed && (
            <div
              style={{
                fontSize: '1.2rem',
                color: remainingGuests > 0 ? '#FF6B6B' : '#00a86b',
                textAlign: 'center',
                padding: '1rem 2rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                zIndex: 1
              }}
            >
              {remainingGuests > 0 
                ? `${remainingGuests} more ${remainingGuests === 1 ? 'guest' : 'guests'} needed to reveal the name`
                : "All guests have checked in!"}
            </div>
          )}

          {!isRevealed && remainingGuests === 0 && (
            <button
              onClick={onReveal}
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: '#00a86b',
                border: 'none',
                borderRadius: '30px',
                padding: '1rem 2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 168, 107, 0.3)',
                animation: 'pulse 2s infinite',
                zIndex: 11
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.05) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 168, 107, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 168, 107, 0.3)';
              }}
            >
              🎭 Reveal the Name 🎭
            </button>
          )}

          {isRevealed && (
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#FFD700',
                textAlign: 'center',
                padding: '1rem 2rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                zIndex: 1,
                opacity: 0,
                animation: 'fadeIn 1s ease-out 0.5s forwards'
              }}
            >
              🎉 Congratulations! The team name has been revealed! 🎊
            </div>
          )}
          <div className={`curtain-container ${isRevealed ? 'reveal' : ''}`}>
            <div className="curtain-left"></div>
            <div className="curtain-right"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameReveal;