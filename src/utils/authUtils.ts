// Utility to clear all authentication state and force refresh
export const clearAuthCache = () => {
  // Clear any localStorage auth data
  localStorage.removeItem('supabase.auth.token');
  
  // Force a page reload to clear all cached state
  window.location.reload();
};

export const forceAuthRefresh = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.auth.refreshSession();
    
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