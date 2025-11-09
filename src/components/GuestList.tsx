import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GuestListProps {
  guests: Array<{
    id: string;
    name: string;
    hasRevealed: boolean;
    passcode: string;
  }>;
  onGuestAuthenticate: (guestId: string) => void;
}

const GuestList: React.FC<GuestListProps> = ({ guests, onGuestAuthenticate }) => {
  const [passcodes, setPasscodes] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handlePasscodeChange = (guestId: string, value: string) => {
    setPasscodes(prev => ({
      ...prev,
      [guestId]: value
    }));
    // Clear error when user starts typing
    if (errors[guestId]) {
      setErrors(prev => ({
        ...prev,
        [guestId]: ''
      }));
    }
  };

  const handleAuthenticate = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    const enteredPasscode = passcodes[guestId]?.trim();

    if (!guest) {
      setErrors(prev => ({
        ...prev,
        [guestId]: 'Guest not found'
      }));
      return;
    }

    if (!enteredPasscode) {
      setErrors(prev => ({
        ...prev,
        [guestId]: 'Please enter a passcode'
      }));
      return;
    }

    try {
      if (enteredPasscode === guest.passcode) {
        onGuestAuthenticate(guestId);
        // Clear passcode after successful authentication
        setPasscodes(prev => ({
          ...prev,
          [guestId]: ''
        }));
        setErrors(prev => ({
          ...prev,
          [guestId]: ''
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [guestId]: 'Incorrect passcode'
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [guestId]: 'Authentication failed'
      }));
    }
  };

  return (
    <div className="guest-list">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>Special Guests</h2>
      <div className="guest-items">
        {guests.map((guest) => (
          <motion.div
            key={guest.id}
            className="guest-item"
            whileHover={{ scale: 1.01 }}
          >
            <span className="guest-name">{guest.name}</span>
            {!guest.hasRevealed ? (
              <div className="auth-section">
                <input
                  type="password"
                  placeholder="Enter passcode"
                  className={`passcode-input ${errors[guest.id] ? 'error' : ''}`}
                  value={passcodes[guest.id] || ''}
                  onChange={(e) => handlePasscodeChange(guest.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAuthenticate(guest.id);
                    }
                  }}
                />
                <button
                  className="authenticate-button"
                  onClick={() => handleAuthenticate(guest.id)}
                  disabled={!passcodes[guest.id]}
                >
                  Authenticate
                </button>
                {errors[guest.id] && (
                  <div className="error-message">{errors[guest.id]}</div>
                )}
              </div>
            ) : (
              <span className="revealed-badge">✓ Joined</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GuestList;