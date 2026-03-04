/**
 * API Client for Roots Configurator Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Set auth token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove auth token
 */
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Get stored user
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set stored user
 */
export const setStoredUser = (user) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

/**
 * Remove stored user
 */
export const removeStoredUser = () => {
  localStorage.removeItem('auth_user');
};

/**
 * Make API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        removeAuthToken();
        removeStoredUser();
        window.location.href = '/login';
      }

      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (email, password, name) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    return apiRequest('/api/projects');
  },

  getById: async (id) => {
    return apiRequest(`/api/projects/${id}`);
  },

  create: async (projectData) => {
    return apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  update: async (id, projectData) => {
    return apiRequest(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  duplicate: async (id) => {
    return apiRequest(`/api/projects/${id}/duplicate`, {
      method: 'POST',
    });
  },
};

// Catalogs API
export const catalogsAPI = {
  getModuleTypes: async () => {
    return apiRequest('/api/catalogs/module-types');
  },

  getModules: async () => {
    return apiRequest('/api/catalogs/modules');
  },

  getConnections: async () => {
    return apiRequest('/api/catalogs/connections');
  },

  getPipes: async () => {
    return apiRequest('/api/catalogs/pipes');
  },

  getDimensions: async () => {
    return apiRequest('/api/catalogs/dimensions');
  },

  addModule: async (moduleData) => {
    return apiRequest('/api/catalogs/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  },

  updateModule: async (id, moduleData) => {
    return apiRequest(`/api/catalogs/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    });
  },

  deleteModule: async (id) => {
    return apiRequest(`/api/catalogs/modules/${id}`, {
      method: 'DELETE',
    });
  },

  // Module Types
  addModuleType: async (moduleTypeData) => {
    return apiRequest('/api/catalogs/module-types', {
      method: 'POST',
      body: JSON.stringify(moduleTypeData),
    });
  },

  updateModuleType: async (id, moduleTypeData) => {
    return apiRequest(`/api/catalogs/module-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moduleTypeData),
    });
  },

  deleteModuleType: async (id) => {
    return apiRequest(`/api/catalogs/module-types/${id}`, {
      method: 'DELETE',
    });
  },

  // Connections
  addConnection: async (connectionData) => {
    return apiRequest('/api/catalogs/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  },

  updateConnection: async (id, connectionData) => {
    return apiRequest(`/api/catalogs/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(connectionData),
    });
  },

  deleteConnection: async (id) => {
    return apiRequest(`/api/catalogs/connections/${id}`, {
      method: 'DELETE',
    });
  },

  // Pipes
  addPipe: async (pipeData) => {
    return apiRequest('/api/catalogs/pipes', {
      method: 'POST',
      body: JSON.stringify(pipeData),
    });
  },

  updatePipe: async (id, pipeData) => {
    return apiRequest(`/api/catalogs/pipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pipeData),
    });
  },

  deletePipe: async (id) => {
    return apiRequest(`/api/catalogs/pipes/${id}`, {
      method: 'DELETE',
    });
  },

  // Dimensions
  addDimension: async (dimensionData) => {
    return apiRequest('/api/catalogs/dimensions', {
      method: 'POST',
      body: JSON.stringify(dimensionData),
    });
  },

  updateDimension: async (id, dimensionData) => {
    return apiRequest(`/api/catalogs/dimensions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dimensionData),
    });
  },

  deleteDimension: async (id) => {
    return apiRequest(`/api/catalogs/dimensions/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  projects: projectsAPI,
  catalogs: catalogsAPI,
};
