import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/vehicles', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vehicles'
      );
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchVehicleById',
  async (vehicleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vehicle details'
      );
    }
  }
);

// Initial state
const initialState = {
  vehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// Create the slice
const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearVehiclesError: (state) => {
      state.error = null;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchVehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload.vehicles;
        state.pagination = action.payload.pagination || state.pagination;
        state.loading = false;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchVehicleById
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.currentVehicle = action.payload;
        state.loading = false;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearVehiclesError, clearCurrentVehicle } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;