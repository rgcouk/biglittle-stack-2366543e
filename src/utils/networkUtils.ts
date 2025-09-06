// Network utility functions for handling connectivity issues

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const networkErrors = [
    'failed to fetch',
    'network error',
    'timeout',
    'connection refused',
    'no internet',
    'offline'
  ];
  
  return networkErrors.some(pattern => errorMessage.includes(pattern));
};

export const retryWithExponentialBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry non-network errors
      if (!isNetworkError(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 200; // Add up to 200ms jitter
      
      console.log(`Network error, retrying in ${delay + jitter}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  throw lastError;
};

// Check if we're online
export const checkOnlineStatus = (): boolean => {
  return navigator.onLine;
};

// Set up online/offline listeners
export const setupNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  const handleOnline = () => {
    console.log('Network connection restored');
    onOnline();
  };
  
  const handleOffline = () => {
    console.log('Network connection lost');
    onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};