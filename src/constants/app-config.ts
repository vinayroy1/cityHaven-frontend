export const APP_CONFIG = {
  NAME: 'Awasio',
  VERSION: '1.0.0',
  DESCRIPTION: 'Find your perfect property in the city',
  
  // API Configuration
  API: {
    get BASE_URL() {
      if (typeof window !== 'undefined') {
        const currentHost = window.location.hostname;
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          const envUrl = process.env.NEXT_PUBLIC_API_URL;
          if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
            return envUrl;
          }
          return 'http://localhost:4000/api';
        }
        return `${window.location.protocol}//${window.location.host}/api`;
      }
      return (
        process.env.INTERNAL_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "http://awasio-backend:4000/api"
          : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api")
      );
    },
    TIMEOUT: 30000,
    RETRIES: 3,
  },
  
  // UI Configuration
  UI: {
    ITEMS_PER_PAGE: 12,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Auth Configuration
  AUTH: {
    TOKEN_KEY: 'awasio_access_token',
    ADMIN_TOKEN_KEY: 'awasio_admin_token',
    REFRESH_TOKEN_KEY: 'awasio_refresh_token',
    USER_KEY: 'awasio_user',
    TOKEN_EXPIRY_DAYS: 7,
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
    ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },
  
  // SEO Configuration
  SEO: {
    DEFAULT_TITLE: 'Awasio - Find Your Perfect Property',
    DEFAULT_DESCRIPTION: 'Discover amazing properties in your city with Awasio',
    KEYWORDS: ['real estate', 'property', 'city', 'home', 'apartment'],
  },
} as const;