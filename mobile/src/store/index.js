import { configureStore } from '@reduxjs/toolkit';

// Import slices
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import guidesReducer from './slices/guidesSlice';
import vehiclesReducer from './slices/vehiclesSlice';
import locationsReducer from './slices/locationsSlice';
import itinerariesReducer from './slices/itinerariesSlice';
import bookingsReducer from './slices/bookingsSlice';
import socialReducer from './slices/socialSlice';
import eventsReducer from './slices/eventsSlice';
import notificationsReducer from './slices/notificationsSlice';

// Configure the store
const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    guides: guidesReducer,
    vehicles: vehiclesReducer,
    locations: locationsReducer,
    itineraries: itinerariesReducer,
    bookings: bookingsReducer,
    social: socialReducer,
    events: eventsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;