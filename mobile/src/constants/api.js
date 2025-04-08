// Base URLs for different environments
const DEV_API_URL = 'http://localhost:5000/api';
const STAGING_API_URL = 'https://staging-api.srilankaguide.com/api';
const PROD_API_URL = 'https://api.srilankaguide.com/api';

// Select API URL based on environment
const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API endpoints organized by feature
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_URL}/auth/reset-password`,
    VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
    REFRESH_TOKEN: `${API_URL}/auth/refresh-token`,
  },
  
  // User endpoints
  USERS: {
    PROFILE: `${API_URL}/users/profile`,
    UPDATE_PROFILE: `${API_URL}/users/profile`,
    UPLOAD_AVATAR: `${API_URL}/users/avatar`,
    CHANGE_PASSWORD: `${API_URL}/users/change-password`,
  },
  
  // Tourist endpoints
  TOURISTS: {
    PROFILE: `${API_URL}/tourists/profile`,
    PREFERENCES: `${API_URL}/tourists/preferences`,
  },
  
  // Guide endpoints
  GUIDES: {
    LIST: `${API_URL}/guides`,
    DETAILS: (id) => `${API_URL}/guides/${id}`,
    AVAILABILITY: (id) => `${API_URL}/guides/${id}/availability`,
    REVIEWS: (id) => `${API_URL}/guides/${id}/reviews`,
    SERVICES: (id) => `${API_URL}/guides/${id}/services`,
  },
  
  // Vehicle owner endpoints
  VEHICLE_OWNERS: {
    PROFILE: `${API_URL}/vehicle-owners/profile`,
    VEHICLES: `${API_URL}/vehicle-owners/vehicles`,
  },
  
  // Vehicle endpoints
  VEHICLES: {
    LIST: `${API_URL}/vehicles`,
    DETAILS: (id) => `${API_URL}/vehicles/${id}`,
    AVAILABILITY: (id) => `${API_URL}/vehicles/${id}/availability`,
    REVIEWS: (id) => `${API_URL}/vehicles/${id}/reviews`,
  },
  
  // Location endpoints
  LOCATIONS: {
    LIST: `${API_URL}/locations`,
    DETAILS: (id) => `${API_URL}/locations/${id}`,
    NEARBY: `${API_URL}/locations/nearby`,
    SEARCH: `${API_URL}/locations/search`,
    CATEGORIES: `${API_URL}/locations/categories`,
  },
  
  // Itinerary endpoints
  ITINERARIES: {
    LIST: `${API_URL}/itineraries`,
    DETAILS: (id) => `${API_URL}/itineraries/${id}`,
    CREATE: `${API_URL}/itineraries`,
    UPDATE: (id) => `${API_URL}/itineraries/${id}`,
    DELETE: (id) => `${API_URL}/itineraries/${id}`,
    ITEMS: (id) => `${API_URL}/itineraries/${id}/items`,
  },
  
  // Booking endpoints
  BOOKINGS: {
    GUIDE: {
      LIST: `${API_URL}/bookings/guides`,
      CREATE: `${API_URL}/bookings/guides`,
      DETAILS: (id) => `${API_URL}/bookings/guides/${id}`,
      CANCEL: (id) => `${API_URL}/bookings/guides/${id}/cancel`,
    },
    VEHICLE: {
      LIST: `${API_URL}/bookings/vehicles`,
      CREATE: `${API_URL}/bookings/vehicles`,
      DETAILS: (id) => `${API_URL}/bookings/vehicles/${id}`,
      CANCEL: (id) => `${API_URL}/bookings/vehicles/${id}/cancel`,
    },
  },
  
  // Social endpoints
  SOCIAL: {
    POSTS: {
      LIST: `${API_URL}/social/posts`,
      CREATE: `${API_URL}/social/posts`,
      DETAILS: (id) => `${API_URL}/social/posts/${id}`,
      LIKE: (id) => `${API_URL}/social/posts/${id}/like`,
      UNLIKE: (id) => `${API_URL}/social/posts/${id}/unlike`,
      COMMENTS: (id) => `${API_URL}/social/posts/${id}/comments`,
    },
    USER_POSTS: (userId) => `${API_URL}/social/users/${userId}/posts`,
    LOCATION_POSTS: (locationId) => `${API_URL}/social/locations/${locationId}/posts`,
  },
  
  // Event endpoints
  EVENTS: {
    LIST: `${API_URL}/events`,
    DETAILS: (id) => `${API_URL}/events/${id}`,
    NEARBY: `${API_URL}/events/nearby`,
    UPCOMING: `${API_URL}/events/upcoming`,
    CATEGORIES: `${API_URL}/events/categories`,
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${API_URL}/notifications`,
    MARK_READ: (id) => `${API_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_URL}/notifications/read-all`,
    SETTINGS: `${API_URL}/notifications/settings`,
  },
  
  // Message endpoints
  MESSAGES: {
    CONVERSATIONS: `${API_URL}/messages/conversations`,
    CONVERSATION_MESSAGES: (id) => `${API_URL}/messages/conversations/${id}`,
    SEND: `${API_URL}/messages`,
  },
  
  // Review endpoints
  REVIEWS: {
    CREATE: `${API_URL}/reviews`,
    USER_REVIEWS: `${API_URL}/reviews/user`,
  },
  
  // Payment endpoints
  PAYMENTS: {
    METHODS: `${API_URL}/payments/methods`,
    PROCESS: `${API_URL}/payments/process`,
    HISTORY: `${API_URL}/payments/history`,
  },
};

export default API_ENDPOINTS;