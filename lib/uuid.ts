// UUID generation utility for client-side identification
export function generateUUID(): string {
  // Generate a random UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create a client UUID from localStorage
export function getClientUUID(): string {
  const STORAGE_KEY = 'grp_client_uuid';
  
  try {
    // Try to get existing UUID from localStorage
    let clientUUID = localStorage.getItem(STORAGE_KEY);
    
    if (!clientUUID) {
      // Generate new UUID if none exists
      clientUUID = generateUUID();
      localStorage.setItem(STORAGE_KEY, clientUUID);
      console.log('[UUID] Generated new client UUID:', clientUUID);
    } else {
      console.log('[UUID] Using existing client UUID:', clientUUID);
    }
    
    return clientUUID;
  } catch (error) {
    // Fallback if localStorage is not available
    console.warn('[UUID] localStorage not available, generating temporary UUID');
    return generateUUID();
  }
}

// Clear client UUID (useful for testing or reset)
export function clearClientUUID(): void {
  const STORAGE_KEY = 'grp_client_uuid';
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[UUID] Cleared client UUID');
  } catch (error) {
    console.warn('[UUID] Could not clear UUID from localStorage');
  }
}
