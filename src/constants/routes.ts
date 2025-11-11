export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PROPERTY_LISTING: '/propertyListing',
  PROPERTY_DETAIL: '/properties/[id]',
  
  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  DASHBOARD_PROPERTIES: '/dashboard/properties',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  
  // API routes
  API_HEALTH: '/api/health',
  API_AUTH: '/api/auth',
  API_PROPERTIES: '/api/properties',
} as const;

export const EXTERNAL_ROUTES = {
  GITHUB: 'https://github.com/your-org/cityhaven-frontend',
  DOCS: 'https://docs.cityhaven.com',
  SUPPORT: 'https://support.cityhaven.com',
} as const;