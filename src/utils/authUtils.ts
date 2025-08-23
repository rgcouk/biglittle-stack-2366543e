// Utility to clear all authentication state and force refresh
export const clearAuthCache = () => {
  // Clear any localStorage auth data
  localStorage.removeItem('supabase.auth.token');
  
  // Force a page reload to clear all cached state
  window.location.reload();
};

export const forceAuthRefresh = async () => {
  try {
    // Force refresh the current session
    const { data, error } = await import('@/integrations/supabase/client').then(module => 
      module.supabase.auth.refreshSession()
    );
    
    if (error) {
      console.error('Failed to refresh session:', error);
    } else {
      console.log('Session refreshed:', data.user?.id);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error refreshing auth:', error);
    return { data: null, error };
  }
};