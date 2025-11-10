interface GuestState {
  isNameRevealed: boolean;
  authenticatedGuests: string[];
  lastUpdated: number;
}

const API_BASE = import.meta.env.VITE_WORKER_URL || 'https://your-worker.username.workers.dev';

const defaultState: GuestState = {
  isNameRevealed: false,
  authenticatedGuests: [],
  lastUpdated: Date.now()
};

export const loadGuestState = async (): Promise<GuestState> => {
  try {
    const response = await fetch(`${API_BASE}/state`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch state');
    }

    const state = await response.json();
    localStorage.setItem('guestStateCached', JSON.stringify(state));
    return state;
  } catch (error) {
    console.error('Error loading guest state:', error);
    const cachedData = localStorage.getItem('guestStateCached');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return defaultState;
  }
};

export const saveGuestState = async (state: GuestState): Promise<void> => {
  try {
    state.lastUpdated = Date.now();

    const response = await fetch(`${API_BASE}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      throw new Error(`Failed to save state: ${response.status}`);
    }

    localStorage.setItem('guestStateCached', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving guest state:', error);
    localStorage.setItem('guestStateCached', JSON.stringify(state));
  }
};

export const addAuthenticatedGuest = async (guestId: string): Promise<void> => {
  const currentState = await loadGuestState();
  if (!currentState.authenticatedGuests.includes(guestId)) {
    currentState.authenticatedGuests.push(guestId);
    await saveGuestState(currentState);
  }
};

export const setNameRevealed = async (revealed: boolean): Promise<void> => {
  const currentState = await loadGuestState();
  currentState.isNameRevealed = revealed;
  await saveGuestState(currentState);
};

export const startStatePolling = (onUpdate: (state: GuestState) => void, interval = 5000): () => void => {
  let lastKnownUpdate = 0;
  
  const pollInterval = setInterval(async () => {
    try {
      const state = await loadGuestState();
      if (state.lastUpdated > lastKnownUpdate) {
        lastKnownUpdate = state.lastUpdated;
        onUpdate(state);
      }
    } catch (error) {
      console.error('Error polling state:', error);
    }
  }, interval);

  return () => clearInterval(pollInterval);
};