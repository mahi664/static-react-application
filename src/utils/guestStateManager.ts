interface GuestState {
  isNameRevealed: boolean;
  authenticatedGuests: string[]; // Array of guest IDs
  lastUpdated: number; // Timestamp for tracking updates
}

// Gist configuration
const GIST_ID = '2569e56f06697ddb330371c012ab7341'; // Your public gist ID
const GIST_FILENAME = 'guestState.json';
const API_BASE = 'https://api.github.com';

// Get token from environment or window
const getGitHubToken = (): string | undefined => {
  return import.meta.env.VITE_GITHUB_TOKEN || window?.ENV?.GITHUB_TOKEN;
};

// Helper function to create headers
const getHeaders = () => ({
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
});

const defaultState: GuestState = {
  isNameRevealed: false,
  authenticatedGuests: [],
  lastUpdated: Date.now()
};

// Track rate limit information
let rateLimitRemaining = 5000;
let rateLimitReset = 0;

export const loadGuestState = async (): Promise<GuestState> => {
  try {
    // Check if we're rate limited
    if (rateLimitRemaining <= 1 && Date.now() < rateLimitReset * 1000) {
      console.warn('Rate limit reached, using cached data until reset at:', new Date(rateLimitReset * 1000).toLocaleString());
      const cachedData = localStorage.getItem('guestStateCached');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return defaultState;
    }

    const response = await fetch(`${API_BASE}/gists/${GIST_ID}`, {
      headers: {
        ...getHeaders(),
        'Authorization': `token ${getGitHubToken()}`  // Always use auth for higher rate limits
      }
    });

    // Update rate limit info from response headers
    rateLimitRemaining = parseInt(response.headers.get('x-ratelimit-remaining') || '5000');
    rateLimitReset = parseInt(response.headers.get('x-ratelimit-reset') || '0');

    if (!response.ok) {
      if (response.status === 403 && rateLimitRemaining === 0) {
        console.warn('Rate limit exceeded, using cached data');
        const cachedData = localStorage.getItem('guestStateCached');
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }
      throw new Error('Failed to fetch state');
    }

    const gistData = await response.json();
    const content = gistData.files[GIST_FILENAME].content;
    const state = JSON.parse(content) as GuestState;

    // Update local cache
    localStorage.setItem('guestStateCached', JSON.stringify(state));
    localStorage.setItem('guestStateTimestamp', Date.now().toString());

    return state;
  } catch (error) {
    console.error('Error loading guest state:', error);
    // If API fails, try to return cached data
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

    const token = getGitHubToken();
    // Debug logs
    console.log('Token available:', !!token);
    console.log('Token value:', token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : 'none'); // Show first/last 4 chars only
    console.log('Token length:', token?.length);

    if (!token) {
      throw new Error('GitHub token is required for updating the gist');
    }

    // Ensure token is properly formatted (remove any whitespace)
    const cleanToken = token.trim();

    const headers = new Headers();
    headers.append('Authorization', `token ${cleanToken}`); // Using 'token' prefix instead of 'Bearer'
    headers.append('Accept', 'application/vnd.github.v3+json');
    headers.append('Content-Type', 'application/json');

    console.log('Request headers:', Object.fromEntries(headers.entries())); // Debug log

    const response = await fetch(`${API_BASE}/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        description: "Updated by Name Reveal App",
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(state)
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to save state:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      });
      throw new Error(`Failed to save state: ${response.status} ${errorData}`);
    }

    // Update local cache
    localStorage.setItem('guestStateCached', JSON.stringify(state));
    localStorage.setItem('guestStateTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Error saving guest state:', error);
    // Still update local cache even if API fails
    localStorage.setItem('guestStateCached', JSON.stringify(state));
    localStorage.setItem('guestStateTimestamp', Date.now().toString());
  }
};

export const addAuthenticatedGuest = async (guestId: string): Promise<void> => {
  try {
    const currentState = await loadGuestState();
    if (!currentState.authenticatedGuests.includes(guestId)) {
      currentState.authenticatedGuests.push(guestId);
      await saveGuestState(currentState);
    }
  } catch (error) {
    console.error('Error authenticating guest:', error);
    throw error;
  }
};

export const setNameRevealed = async (revealed: boolean): Promise<void> => {
  try {
    const currentState = await loadGuestState();
    currentState.isNameRevealed = revealed;
    await saveGuestState(currentState);
  } catch (error) {
    console.error('Error setting name revealed:', error);
    throw error;
  }
};

// Function to start polling for state updates
export const startStatePolling = (onUpdate: (state: GuestState) => void, interval = 5000): () => void => {
  let lastKnownUpdate = 0;
  let consecutiveErrors = 0;
  
  const pollInterval = setInterval(async () => {
    try {
      // Exponential backoff if we're getting errors
      if (consecutiveErrors > 0) {
        const backoffTime = Math.min(interval * Math.pow(2, consecutiveErrors), 60000); // Max 1 minute
        if (backoffTime > interval) {
          console.log(`Backing off polling for ${backoffTime/1000} seconds due to errors`);
          return;
        }
      }

      const state = await loadGuestState();
      if (state.lastUpdated > lastKnownUpdate) {
        lastKnownUpdate = state.lastUpdated;
        onUpdate(state);
      }
      consecutiveErrors = 0; // Reset error count on success
    } catch (error) {
      console.error('Error polling state:', error);
      consecutiveErrors++;
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(pollInterval);
};