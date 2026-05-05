export const RISK_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const RESOURCE_TYPES = {
  FOGGING_UNITS: 'Fogging_Units',
  HEALTH_INSPECTORS: 'Health_Inspectors',
  INSPECTION_TEAMS: 'Inspection_Teams',
  TREATMENT_UNITS: 'Treatment_Units',
};

export const API_ENDPOINTS = {
  RESOURCES: '/resources/',
  PREDICTIONS: '/predictions/',
  HOTSPOTS: '/predictions/hotspots',
  ADMIN: '/admin/',
  PILOT_CONFIG: '/pilot/config',
  PILOT_REPORTS: '/pilot/reports',
};

export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

// Pilot Study Configuration
export const PILOT_CONFIG = {
  ENABLED: true,  // Set to false to hide pilot features
  CITY: 'Colombo',
  GN_DIVISIONS: [
    {
      code: 'CMB-GN-01',
      name: 'Kollupitiya',
      displayName: 'CMB-GN-01 Kollupitiya'
    },
    {
      code: 'CMB-GN-02', 
      name: 'Bambalapitiya',
      displayName: 'CMB-GN-02 Bambalapitiya'
    },
    {
      code: 'CMB-GN-03',
      name: 'Wellawatte',
      displayName: 'CMB-GN-03 Wellawatte'
    }
  ]
};

export const REPORT_TYPES = {
  HOSPITAL: 'hospital_reports',
  GN_LOCAL: 'gn_local_reports', 
  DIVISIONAL: 'divisional_secretariat_reports',
  URBAN_COUNCIL: 'urban_council_reports',
};