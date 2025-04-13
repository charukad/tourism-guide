// Base URLs for different environments
const DEV_API_URL = 'http://localhost:5008/api';
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
    ME: `${API_URL}/auth/me`,
  },
  
  // User endpoints
  USERS: {
    PROFILE: `${API_URL}/users/profile`,
    UPDATE_PROFILE: `${API_URL}/users/profile`,
    UPLOAD_AVATAR: `${API_URL}/users/avatar`,
    CHANGE_PASSWORD: `${API_URL}/users/change-password`,
    GET_BY_ID: (id) => `${API_URL}/users/${id}`,
    FOLLOW: (id) => `${API_URL}/users/${id}/follow`,
    UNFOLLOW: (id) => `${API_URL}/users/${id}/unfollow`,
    FOLLOWERS: (id) => `${API_URL}/users/${id}/followers`,
    FOLLOWING: (id) => `${API_URL}/users/${id}/following`,
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
    FEATURED: `${API_URL}/guides/featured`,
    VERIFY: (id) => `${API_URL}/guides/${id}/verify`,
    PORTFOLIO: (id) => `${API_URL}/guides/${id}/portfolio`,
  },
  
  // Vehicle owner endpoints
  VEHICLE_OWNERS: {
    PROFILE: `${API_URL}/vehicle-owners/profile`,
    VEHICLES: `${API_URL}/vehicle-owners/vehicles`,
    VERIFY: (id) => `${API_URL}/vehicle-owners/${id}/verify`,
  },
  
  // Vehicle endpoints
  VEHICLES: {
    LIST: `${API_URL}/vehicles`,
    DETAILS: (id) => `${API_URL}/vehicles/${id}`,
    AVAILABILITY: (id) => `${API_URL}/vehicles/${id}/availability`,
    REVIEWS: (id) => `${API_URL}/vehicles/${id}/reviews`,
    SEARCH: `${API_URL}/vehicles/search`,
    CATEGORIES: `${API_URL}/vehicles/categories`,
    VERIFY: (id) => `${API_URL}/vehicles/${id}/verify`,
  },
  
  // Location endpoints
  LOCATIONS: {
    LIST: `${API_URL}/locations`,
    DETAILS: (id) => `${API_URL}/locations/${id}`,
    NEARBY: `${API_URL}/locations/nearby`,
    SEARCH: `${API_URL}/locations/search`,
    CATEGORIES: `${API_URL}/locations/categories`,
    FEATURED: `${API_URL}/locations/featured`,
    REVIEWS: (id) => `${API_URL}/locations/${id}/reviews`,
    PHOTOS: (id) => `${API_URL}/locations/${id}/photos`,
    PANORAMIC: (id) => `${API_URL}/locations/${id}/panoramic`,
  },
  
  // Itinerary endpoints
  ITINERARIES: {
    LIST: `${API_URL}/itineraries`,
    DETAILS: (id) => `${API_URL}/itineraries/${id}`,
    CREATE: `${API_URL}/itineraries`,
    UPDATE: (id) => `${API_URL}/itineraries/${id}`,
    DELETE: (id) => `${API_URL}/itineraries/${id}`,
    ITEMS: (id) => `${API_URL}/itineraries/${id}/items`,
    ITEM_DETAILS: (itineraryId, itemId) => `${API_URL}/itineraries/${itineraryId}/items/${itemId}`,
    ADD_ITEM: (id) => `${API_URL}/itineraries/${id}/items`,
    UPDATE_ITEM: (itineraryId, itemId) => `${API_URL}/itineraries/${itineraryId}/items/${itemId}`,
    DELETE_ITEM: (itineraryId, itemId) => `${API_URL}/itineraries/${itineraryId}/items/${itemId}`,
    CALCULATE_ROUTE: (id) => `${API_URL}/itineraries/${id}/calculate-route`,
    DAILY_SUMMARY: (id) => `${API_URL}/itineraries/${id}/daily-summary`,
    COLLABORATORS: (id) => `${API_URL}/itineraries/${id}/collaborators`,
    PUBLIC: `${API_URL}/itineraries/public`,
    SHARE: (id) => `${API_URL}/itineraries/${id}/share`,
    ADD_EVENT: (itineraryId, eventId) => `${API_URL}/itineraries/${itineraryId}/events/${eventId}`,
  },
  
  // Booking endpoints
  BOOKINGS: {
    GUIDE: {
      LIST: `${API_URL}/bookings/guides`,
      CREATE: `${API_URL}/bookings/guides`,
      DETAILS: (id) => `${API_URL}/bookings/guides/${id}`,
      CANCEL: (id) => `${API_URL}/bookings/guides/${id}/cancel`,
      UPDATE: (id) => `${API_URL}/bookings/guides/${id}`,
      CONFIRM: (id) => `${API_URL}/bookings/guides/${id}/confirm`,
    },
    VEHICLE: {
      LIST: `${API_URL}/bookings/vehicles`,
      CREATE: `${API_URL}/bookings/vehicles`,
      DETAILS: (id) => `${API_URL}/bookings/vehicles/${id}`,
      CANCEL: (id) => `${API_URL}/bookings/vehicles/${id}/cancel`,
      UPDATE: (id) => `${API_URL}/bookings/vehicles/${id}`,
      CONFIRM: (id) => `${API_URL}/bookings/vehicles/${id}/confirm`,
    },
  },
  
  // Social feed endpoints
  SOCIAL: {
    POSTS: {
      LIST: `${API_URL}/posts`,
      FEED: `${API_URL}/posts/feed`,
      FEATURED: `${API_URL}/posts/featured`,
      TRENDING: `${API_URL}/posts/trending`,
      NEARBY: `${API_URL}/posts/nearby`,
      CREATE: `${API_URL}/posts`,
      DETAILS: (id) => `${API_URL}/posts/${id}`,
      UPDATE: (id) => `${API_URL}/posts/${id}`,
      DELETE: (id) => `${API_URL}/posts/${id}`,
      LIKE: (id) => `${API_URL}/posts/${id}/like`,
      SAVE: (id) => `${API_URL}/posts/${id}/save`,
      COMMENTS: (id) => `${API_URL}/posts/${id}/comments`,
      COMMENT: (postId, commentId) => `${API_URL}/posts/${postId}/comments/${commentId}`,
      LIKE_COMMENT: (postId, commentId) => `${API_URL}/posts/${postId}/comments/${commentId}/like`,
      REPLY: (postId, commentId) => `${API_URL}/posts/${postId}/comments/${commentId}/replies`,
    },
    USER_POSTS: (userId) => `${API_URL}/users/${userId}/posts`,
    LOCATION_POSTS: (locationId) => `${API_URL}/locations/${locationId}/posts`,
    SAVED_POSTS: `${API_URL}/posts/saved`,
    HASHTAGS: {
      TRENDING: `${API_URL}/hashtags/trending`,
      SEARCH: `${API_URL}/hashtags/search`,
      POSTS: (tag) => `${API_URL}/hashtags/${tag}/posts`,
    },
  },
  
  // Event endpoints
  EVENTS: {
    LIST: `${API_URL}/events`,
    DETAILS: (id) => `${API_URL}/events/${id}`,
    FEATURED: `${API_URL}/events/featured`,
    NEARBY: `${API_URL}/events/nearby`,
    UPCOMING: `${API_URL}/events/upcoming`,
    ONGOING: `${API_URL}/events/ongoing`,
    PAST: `${API_URL}/events/past`,
    THIS_MONTH: `${API_URL}/events/this-month`,
    CATEGORIES: `${API_URL}/events/categories`,
    BY_DATE: `${API_URL}/events/date`,
    DATES: `${API_URL}/events/dates`,
    SAVE: (id) => `${API_URL}/events/${id}/save`,
    SAVED: `${API_URL}/events/saved`,
    SEARCH: `${API_URL}/events/search`,
    CALENDAR: `${API_URL}/events/calendar`,
  },
  
  // Cultural information endpoints
  CULTURAL_INFO: {
    LIST: `${API_URL}/cultural-info`,
    DETAILS: (id) => `${API_URL}/cultural-info/${id}`,
    CATEGORIES: `${API_URL}/cultural-info/categories`,
    SEARCH: `${API_URL}/cultural-info/search`,
    FEATURED: `${API_URL}/cultural-info/featured`,
    RELATED_EVENTS: (id) => `${API_URL}/cultural-info/${id}/events`,
    ETIQUETTE: `${API_URL}/cultural-info/etiquette`,
    CUSTOMS: `${API_URL}/cultural-info/customs`,
    RELIGIONS: `${API_URL}/cultural-info/religions`,
    FESTIVALS: `${API_URL}/cultural-info/festivals`,
    CUISINE: `${API_URL}/cultural-info/cuisine`,
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${API_URL}/notifications`,
    UNREAD_COUNT: `${API_URL}/notifications/unread-count`,
    MARK_READ: (id) => `${API_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_URL}/notifications/read-all`,
    SETTINGS: `${API_URL}/notifications/settings`,
    SUBSCRIBE: `${API_URL}/notifications/subscribe`,
    UNSUBSCRIBE: `${API_URL}/notifications/unsubscribe`,
  },
  
  // Messaging endpoints
  MESSAGES: {
    CONVERSATIONS: `${API_URL}/messages/conversations`,
    CONVERSATION_MESSAGES: (id) => `${API_URL}/messages/conversations/${id}`,
    SEND: `${API_URL}/messages`,
    MARK_READ: (id) => `${API_URL}/messages/${id}/read`,
    DELETE: (id) => `${API_URL}/messages/${id}`,
    UNREAD_COUNT: `${API_URL}/messages/unread-count`,
  },
  
  // Review endpoints
  REVIEWS: {
    CREATE: `${API_URL}/reviews`,
    UPDATE: (id) => `${API_URL}/reviews/${id}`,
    DELETE: (id) => `${API_URL}/reviews/${id}`,
    USER_REVIEWS: (userId) => `${API_URL}/users/${userId}/reviews`,
    HELPFUL: (id) => `${API_URL}/reviews/${id}/helpful`,
  },
  
  // Payment endpoints
  PAYMENTS: {
    METHODS: `${API_URL}/payments/methods`,
    ADD_METHOD: `${API_URL}/payments/methods`,
    DELETE_METHOD: (id) => `${API_URL}/payments/methods/${id}`,
    PROCESS: `${API_URL}/payments/process`,
    HISTORY: `${API_URL}/payments/history`,
    TRANSACTION: (id) => `${API_URL}/payments/transactions/${id}`,
    REFUND: (id) => `${API_URL}/payments/transactions/${id}/refund`,
  },
  
  // Weather and alerts endpoints
  ALERTS: {
    WEATHER: `${API_URL}/alerts/weather`,
    SAFETY: `${API_URL}/alerts/safety`,
    TRANSPORTATION: `${API_URL}/alerts/transportation`,
    SUBSCRIBE: `${API_URL}/alerts/subscribe`,
    UNSUBSCRIBE: `${API_URL}/alerts/unsubscribe`,
  },
};

export default API_ENDPOINTS;