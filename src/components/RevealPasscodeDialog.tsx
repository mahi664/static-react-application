import React, { useState } from 'react';

interface RevealPasscodeDialogProps {
  onSubmit: (passcode: string) => void;
  onCancel: () => void;
}

const RevealPasscodeDialog: React.FC<RevealPasscodeDialogProps> = ({ onSubmit, onCancel }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }
    onSubmit(passcode.trim());
  };

  return (
    <div className="reveal-dialog-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div className="reveal-dialog" style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>Enter Admin Passcode</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError('');
            }}
            placeholder="Enter passcode"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
            autoFocus
          />
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                background: '#00a86b',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevealPasscodeDialog;