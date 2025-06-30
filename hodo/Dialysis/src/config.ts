const getApiUrl = (): string => {
  const hostname: string = window.location.hostname;
  const port: number = 5000; // API server port
  
  // For localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}/api`;
  }
  
  // For network access
  return `http://${hostname}:${port}/api`;
};

export const API_URL: string = getApiUrl();

// Log the API URL for debugging
console.log('API URL:', API_URL); 