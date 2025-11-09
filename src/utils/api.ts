// API service for state management
interface GuestState {
  isNameRevealed: boolean;
  authenticatedGuests: string[];
}

const STORAGE_KEY = 'guestRevealState';

export const fetchState = async (): Promise<GuestState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error fetching state:', error);
  }
  return {
    isNameRevealed: false,
    authenticatedGuests: []
  };
};

export const authenticateGuest = async (guestId: string): Promise<GuestState> => {
  try {
    const currentState = await fetchState();
    if (!currentState.authenticatedGuests.includes(guestId)) {
      currentState.authenticatedGuests.push(guestId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    }
    return currentState;
  } catch (error) {
    console.error('Error authenticating guest:', error);
    throw error;
  }
};

export const setNameRevealed = async (revealed: boolean): Promise<GuestState> => {
  try {
    const currentState = await fetchState();
    currentState.isNameRevealed = revealed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    return currentState;
  } catch (error) {
    console.error('Error setting name revealed:', error);
    throw error;
  }
};