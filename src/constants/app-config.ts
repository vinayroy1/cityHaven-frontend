export const APP_CONFIG = {
  NAME: 'CityHaven',
  VERSION: '1.0.0',
  DESCRIPTION: 'Find your perfect property in the city',
  
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
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
    TOKEN_KEY: 'cityhaven_access_token',
    REFRESH_TOKEN_KEY: 'cityhaven_refresh_token',
    USER_KEY: 'cityhaven_user',
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
    DEFAULT_TITLE: 'CityHaven - Find Your Perfect Property',
    DEFAULT_DESCRIPTION: 'Discover amazing properties in your city with CityHaven',
    KEYWORDS: ['real estate', 'property', 'city', 'home', 'apartment'],
  },
} as const;