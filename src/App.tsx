import { useState, useEffect } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import GuestList from './components/GuestList';
import NameReveal from './components/NameReveal';
import RevealButton from './components/RevealButton';
import RevealPasscodeDialog from './components/RevealPasscodeDialog';
import { loadGuestState, addAuthenticatedGuest, setNameRevealed as revealName, startStatePolling } from './utils/guestStateManager';

interface Guest {
  id: string;
  name: string;
  hasRevealed: boolean;
  passcode: string;
}

function App() {
  const [isNameRevealed, setIsNameRevealed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [config, setConfig] = useState({
    revealName: "",
    requiredReveals: 5,
    adminPasscode: ""
  });

  useEffect(() => {
    // Load initial state and start polling
    const loadState = async () => {
      try {
        const state = await loadGuestState();
        setIsNameRevealed(state.isNameRevealed);
        setConfig(state.config);
        if (state.guests) {
          setGuests(state.guests.map(guest => ({
            ...guest,
            hasRevealed: state.authenticatedGuests.includes(guest.id)
          })));
        }
      } catch (error) {
        console.error('Error loading state:', error);
      }
    };
    loadState();

    // Start polling for updates
    const stopPolling = startStatePolling((state) => {
      setIsNameRevealed(state.isNameRevealed);
      if (state.guests) {
        setGuests(state.guests.map(guest => ({
          ...guest,
          hasRevealed: state.authenticatedGuests.includes(guest.id)
        })));
      }
    });

    // Cleanup polling on unmount
    return () => stopPolling();
  }, []);

  const handleGuestAuthenticate = async (guestId: string) => {
    try {
      await addAuthenticatedGuest(guestId);
      const state = await loadGuestState();
      if (state.guests) {
        setGuests(state.guests.map(guest => ({
          ...guest,
          hasRevealed: state.authenticatedGuests.includes(guest.id)
        })));
      }
    } catch (error) {
      console.error('Error authenticating guest:', error);
      alert('Failed to authenticate guest. Please try again.');
    }
  };

  const handleRevealRequest = () => {
    setShowPasscodeDialog(true);
  };

  const handlePasscodeSubmit = async (passcode: string) => {
    if (passcode === config.adminPasscode) {
      try {
        await revealName(true);
        setShowPasscodeDialog(false);
        setIsNameRevealed(true);
      } catch (error) {
        console.error('Error revealing name:', error);
        alert('Failed to reveal name. Please try again.');
      }
    } else {
      alert("Incorrect passcode. Please try again.");
    }
  };

  const handlePasscodeCancel = () => {
    setShowPasscodeDialog(false);
  };

  const revealedCount = guests.filter(guest => guest.hasRevealed).length;
  const canReveal = revealedCount >= config.requiredReveals;

  return (
    <div className="name-reveal-app">
      <AnimatedBackground />
      
      <main className="container">
        <header>
          <h1 className="title">Distributor Web Team Name Revealing Ceremony</h1>
        </header>

        <section className="reveal-section">
          <NameReveal 
            name={config.revealName} 
            isRevealed={isNameRevealed}
            guestCount={revealedCount}
            onReveal={handleRevealRequest}
          />
          
          <div style={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
            <p style={{ 
              fontSize: '1.25rem', 
              opacity: 0.9,
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: '600px'
            }}>
              {isNameRevealed 
                ? "🎉 Congratulations! The team name has been revealed! 🎊"
                : canReveal
                  ? "All set! Click the button to reveal the name!"
                  : `${config.requiredReveals - revealedCount} more guests needed to reveal the name`}
            </p>
            
            {showPasscodeDialog && (
              <RevealPasscodeDialog
                onSubmit={handlePasscodeSubmit}
                onCancel={handlePasscodeCancel}
              />
            )}
          </div>
        </section>

        <section className="guests-section">
          <GuestList
            guests={guests}
            onGuestAuthenticate={handleGuestAuthenticate}
          />
        </section>
      </main>
    </div>
  );
}

export default App
