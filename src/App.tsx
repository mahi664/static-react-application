import { useState, useEffect } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import GuestList from './components/GuestList';
import NameReveal from './components/NameReveal';
import RevealButton from './components/RevealButton';
import RevealPasscodeDialog from './components/RevealPasscodeDialog';
import { loadGuestState, addAuthenticatedGuest, setNameRevealed as revealName, startStatePolling } from './utils/guestStateManager';

const REVEAL_NAME = "The Bulls of Code Street"; // Replace with the actual name to be revealed
const REQUIRED_REVEALS = 5; // Number of guests needed to reveal the name
const ADMIN_PASSCODE = "admin2025"; // Admin passcode for final reveal

interface Guest {
  id: string;
  name: string;
  hasRevealed: boolean;
  passcode: string;
}

const initialGuests: Guest[] = [
  { id: '1', name: 'Siddhi Narkar', hasRevealed: false, passcode: 'SN2025' },
  { id: '2', name: 'Mahesh Ghuge', hasRevealed: false, passcode: 'MG2025' },
  { id: '3', name: 'Akshay Singh Rana', hasRevealed: false, passcode: 'ASR2025' },
  { id: '4', name: 'Deepak Sabharwal', hasRevealed: false, passcode: 'DS2025' },
  { id: '5', name: 'Khemraj Singh', hasRevealed: false, passcode: 'KS2025' },
];

function App() {
  const [isNameRevealed, setIsNameRevealed] = useState(false);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);

  useEffect(() => {
    // Load initial state and start polling
    const loadState = async () => {
      try {
        const state = await loadGuestState();
        setIsNameRevealed(state.isNameRevealed);
        setGuests(initialGuests.map(guest => ({
          ...guest,
          hasRevealed: state.authenticatedGuests.includes(guest.id)
        })));
      } catch (error) {
        console.error('Error loading state:', error);
      }
    };
    loadState();

    // Start polling for updates
    const stopPolling = startStatePolling((state) => {
      setIsNameRevealed(state.isNameRevealed);
      setGuests(initialGuests.map(guest => ({
        ...guest,
        hasRevealed: state.authenticatedGuests.includes(guest.id)
      })));
    });

    // Cleanup polling on unmount
    return () => stopPolling();
  }, []);

  const handleGuestAuthenticate = async (guestId: string) => {
    try {
      await addAuthenticatedGuest(guestId);
      const state = await loadGuestState();
      setGuests(initialGuests.map(guest => ({
        ...guest,
        hasRevealed: state.authenticatedGuests.includes(guest.id)
      })));
    } catch (error) {
      console.error('Error authenticating guest:', error);
      alert('Failed to authenticate guest. Please try again.');
    }
  };

  const handleRevealRequest = () => {
    setShowPasscodeDialog(true);
  };

  const handlePasscodeSubmit = async (passcode: string) => {
    if (passcode === ADMIN_PASSCODE) {
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
  const canReveal = revealedCount >= REQUIRED_REVEALS;

  return (
    <div className="name-reveal-app">
      <AnimatedBackground />
      
      <main className="container">
        <header>
          <h1 className="title">Distributor Web Team Name Revealing Ceremony</h1>
        </header>

        <section className="reveal-section">
          <NameReveal 
            name={REVEAL_NAME} 
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
                  : `${REQUIRED_REVEALS - revealedCount} more guests needed to reveal the name`}
            </p>
            {!isNameRevealed && (
              <RevealButton
                onReveal={handleRevealRequest}
                disabled={!canReveal || isNameRevealed}
              />
            )}
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
