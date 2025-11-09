import React, { useEffect, useState } from 'react';
import { loadGuestState, addAuthenticatedGuest, setNameRevealed, startStatePolling } from '../utils/guestStateManager';

interface GuestState {
  isNameRevealed: boolean;
  authenticatedGuests: string[];
  lastUpdated: number;
}

const StateTest: React.FC = () => {
  const [state, setState] = useState<GuestState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    loadInitialState();

    // Start polling for updates
    const cleanup = startStatePolling((newState) => {
      setState(newState);
    });

    return cleanup;
  }, []);

  const loadInitialState = async () => {
    try {
      setLoading(true);
      const initialState = await loadGuestState();
      setState(initialState);
      setError(null);
    } catch (err) {
      setError('Failed to load state');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      const testGuestId = 'test-guest-' + Date.now();
      await addAuthenticatedGuest(testGuestId);
      await loadInitialState(); // Reload state
    } catch (err) {
      setError('Failed to authenticate guest');
      console.error(err);
    }
  };

  const handleReveal = async () => {
    try {
      await setNameRevealed(true);
      await loadInitialState(); // Reload state
    } catch (err) {
      setError('Failed to reveal name');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!state) return <div>No state available</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>State Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current State:</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleAuthenticate}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Test Guest
        </button>

        <button 
          onClick={handleReveal}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reveal Name
        </button>

        <button 
          onClick={loadInitialState}
          style={{
            padding: '10px 20px',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh State
        </button>
      </div>
    </div>
  );
};

export default StateTest;