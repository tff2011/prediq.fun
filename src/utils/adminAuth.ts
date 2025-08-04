export const getAdminToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

export const getAdminUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const clearAdminAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

export const isAuthenticated = () => {
  return !!getAdminToken();
};