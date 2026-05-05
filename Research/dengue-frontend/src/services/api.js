import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response received', error.request);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== RESOURCE ENDPOINTS ====================

export const resourcesAPI = {
  // Get available resources
  getResources: () => api.get('/resources/'),
  
  // Update available resources
  updateResources: (resources) => api.post('/resources/', resources),
  
  // Assign resources to a district
  assignResources: (assignment) => api.post('/resources/assign', assignment),
  
  // Get all assignments or filter by district
  getAssignments: (district = null) => {
    const params = district ? { district } : {};
    return api.get('/resources/assignments', { params });
  },
  
  // Get total allocated resources
  getTotalAllocated: () => api.get('/resources/total-allocated'),
};

// ==================== PREDICTION ENDPOINTS ====================

export const predictionsAPI = {
  // Generate new predictions
  generatePredictions: () => api.post('/predictions/generate'),
  
  // Get all district predictions
  getDistricts: () => api.get('/predictions/districts'),
  
  // Get specific district prediction
  getDistrict: (districtName) => api.get(`/predictions/districts/${districtName}`),
  
  // Get hotspots (high-risk districts)
  getHotspots: () => api.get('/predictions/hotspots'),
  
  // Get resource recommendations
  getRecommendations: () => api.get('/predictions/recommendations'),

  // ML-based allocation: predict resources for a named district
  getAllocate: (districtName) => api.get(`/predictions/allocate/${encodeURIComponent(districtName)}`),

  // ML-based allocation: predict with custom population & houses
  getAllocateCustom: (population, houses) =>
    api.post('/predictions/allocate', { population, houses }),

  // Get all districts with population and house data
  getDistrictsList: () => api.get('/predictions/districts-list'),
};

// ==================== ADMIN ENDPOINTS ====================

export const adminAPI = {
  // Get complete system overview
  getOverview: () => api.get('/admin/overview'),
  
  // Get statistics
  getStatistics: () => api.get('/admin/statistics'),
  
  // Get resource gap analysis
  getResourceGap: () => api.get('/admin/resource-gap'),
  
  // Compare districts
  compareDistricts: (districts) => {
    const params = { districts: districts.join(',') };
    return api.get('/admin/district-comparison', { params });
  },
};

// ==================== PILOT STUDY ENDPOINTS ====================

export const pilotAPI = {
  // Get pilot configuration
  getConfig: () => api.get('/pilot/config'),
  
  // Get pilot status and statistics
  getStatus: () => api.get('/pilot/status'),
  
  // Check boundary files availability
  getBoundaries: () => api.get('/pilot/boundaries'),
  
  // Get GN master list (full data)
  getGNList: () => api.get('/pilot/gn-list'),
  
  // Get GN options for dropdowns (simplified)
  getGNOptions: () => api.get('/pilot/gn-options'),

  // Master Reports API
  // Create master report (any source)
  createMasterReport: (report) => api.post('/pilot/reports', report),
  
  // List master reports with filters
  getMasterReports: (params = {}) => api.get('/pilot/reports', { params }),
  
  // Get specific master report
  getMasterReport: (reportId) => api.get(`/pilot/reports/${reportId}`),
  
  // Update master report
  updateMasterReport: (reportId, report) => api.put(`/pilot/reports/${reportId}`, report),
  
  // Delete master report
  deleteMasterReport: (reportId) => api.delete(`/pilot/reports/${reportId}`),

  // Source-specific report creation
  createHospitalReport: (report) => api.post('/pilot/reports/hospital', report),
  createDivisionalReport: (report) => api.post('/pilot/reports/divisional', report),
  createUrbanCouncilReport: (report) => api.post('/pilot/reports/urban-council', report),
  createGNLocalReport: (report) => api.post('/pilot/reports/gn-local', report),

  // Pilot Hotspot API (GN-level hotspots)
  getPilotHotspots: () => api.get('/pilot/hotspots'),
  getPilotHotspotConfig: () => api.get('/pilot/hotspots/config'),

  // Pilot Resource Allocation API (Rule-based allocation for GN areas)
  getPilotResourceAllocation: () => api.get('/pilot/resource-allocation'),
  getPilotResourceConfig: () => api.get('/pilot/resource-allocation/config'),

  // Pilot Route Planning API (Route optimization for field operations)
  getPilotRoutePlan: () => api.get('/pilot/route-plan'),
  getPilotRouteConfig: () => api.get('/pilot/route-plan/config'),
  
  // Enhanced Route Planning API (Using routing service interface)
  getEnhancedRoutePlan: () => api.get('/pilot/route-plan/enhanced'),
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  check: () => api.get('/'),
};

// Export the axios instance for custom requests
export default api;