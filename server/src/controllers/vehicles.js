const Vehicle = require('../models/Vehicle');
const VehicleOwner = require('../models/VehicleOwner');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinary');
const errorResponse = require('../utils/errorResponse');

/**
 * @desc    Register a new vehicle
 * @route   POST /api/vehicles
 * @access  Private (Vehicle Owner only)
 */
exports.registerVehicle = async (req, res) => {
  try {
    // Check if user is a vehicle owner
    if (req.user.role !== 'vehicleOwner') {
      return res.status(403).json(
        errorResponse('Access denied. Only vehicle owners can register vehicles', 403)
      );
    }
    
    // Check if vehicle owner is verified
    const vehicleOwner = await VehicleOwner.findOne({ userId: req.user._id });
    
    if (!vehicleOwner || !vehicleOwner.isVerified) {
      return res.status(403).json(
        errorResponse('Your account must be verified before registering vehicles', 403)
      );
    }
    
    // Create new vehicle
    const vehicle = await Vehicle.create({
      ownerId: req.user._id,
      ...req.body
    });
    
    res.status(201).json({
      status: 'success',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error registering vehicle:', error);
    res.status(500).json(
      errorResponse('Server error registering vehicle', 500)
    );
  }
};

/**
 * @desc    Get all vehicles owned by the user
 * @route   GET /api/vehicles/my-vehicles
 * @access  Private (Vehicle Owner only)
 */
exports.getMyVehicles = async (req, res) => {
  try {
    // Check if user is a vehicle owner
    if (req.user.role !== 'vehicleOwner') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a vehicle owner', 403)
      );
    }
    
    // Get all vehicles owned by the user
    const vehicles = await Vehicle.find({ ownerId: req.user._id });
    
    res.status(200).json({
      status: 'success',
      count: vehicles.length,
      data: { vehicles }
    });
  } catch (error) {
    console.error('Error getting vehicles:', error);
    res.status(500).json(
      errorResponse('Server error retrieving vehicles', 500)
    );
  }
};

/**
 * @desc    Get a vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate({
        path: 'ownerId',
        select: 'firstName lastName profileImage',
        model: User
      });
    
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // If the vehicle is not verified, only the owner can view it
    if (!vehicle.isVerified && (!req.user || vehicle.ownerId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json(
        errorResponse('This vehicle is not yet verified or available for public viewing', 403)
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error getting vehicle by ID:', error);
    res.status(500).json(
      errorResponse('Server error retrieving vehicle', 500)
    );
  }
};

/**
 * @desc    Update a vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private (Vehicle Owner only)
 */
exports.updateVehicle = async (req, res) => {
  try {
    // Find vehicle
    let vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Check ownership
    if (vehicle.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        errorResponse('Access denied. You do not own this vehicle', 403)
      );
    }
    
    // Update vehicle
    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json(
      errorResponse('Server error updating vehicle', 500)
    );
  }
};

/**
 * @desc    Delete a vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private (Vehicle Owner only)
 */
exports.deleteVehicle = async (req, res) => {
  try {
    // Find vehicle
    const vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Check ownership
    if (vehicle.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        errorResponse('Access denied. You do not own this vehicle', 403)
      );
    }
    
    // Delete vehicle
    await vehicle.deleteOne();
    
    res.status(200).json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json(
      errorResponse('Server error deleting vehicle', 500)
    );
  }
};

/**
 * @desc    Upload vehicle photos
 * @route   POST /api/vehicles/:id/photos
 * @access  Private (Vehicle Owner only)
 */
exports.uploadVehiclePhotos = async (req, res) => {
  try {
    // Find vehicle
    const vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Check ownership
    if (vehicle.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        errorResponse('Access denied. You do not own this vehicle', 403)
      );
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(
        errorResponse('Please upload at least one photo', 400)
      );
    }
    
    // Upload files to Cloudinary
    const uploadPromises = req.files.map(file => {
      return cloudinaryService.uploadFile(
        file.path,
        'sri-lanka-tourism/vehicles/photos',
        {
          resource_type: 'image',
          public_id: `vehicle_${vehicle._id}_${Date.now()}`
        }
      );
    });
    
    const uploadResults = await Promise.all(uploadPromises);
    
    // Get photo URLs
    const photoUrls = uploadResults.map(result => result.secure_url);
    
    // Add photos to vehicle
    vehicle.photos = [...vehicle.photos, ...photoUrls];
    await vehicle.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        photos: vehicle.photos
      }
    });
  } catch (error) {
    console.error('Error uploading vehicle photos:', error);
    res.status(500).json(
      errorResponse('Server error uploading vehicle photos', 500)
    );
  }
};

/**
 * @desc    Submit vehicle for verification
 * @route   POST /api/vehicles/:id/submit-verification
 * @access  Private (Vehicle Owner only)
 */
exports.submitForVerification = async (req, res) => {
  try {
    // Find vehicle
    const vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json(
        errorResponse('Vehicle not found', 404)
      );
    }
    
    // Check ownership
    if (vehicle.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        errorResponse('Access denied. You do not own this vehicle', 403)
      );
    }
    
    // Check if vehicle has photos
    if (vehicle.photos.length === 0) {
      return res.status(400).json(
        errorResponse('Please upload at least one photo of the vehicle before submitting for verification', 400)
      );
    }
    
    // Update verification status to pending
    vehicle.verificationStatus = 'pending';
    await vehicle.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Your vehicle has been submitted for verification. You will be notified once the process is complete.',
      data: {
        verificationStatus: vehicle.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error submitting vehicle for verification:', error);
    res.status(500).json(
      errorResponse('Server error submitting vehicle for verification', 500)
    );
  }
};

/**
 * @desc    Search vehicles
 * @route   GET /api/vehicles/search
 * @access  Public
 */
exports.searchVehicles = async (req, res) => {
  try {
    // Extract query parameters
    const {
      type,
      capacity,
      features,
      includesDriver,
      minRating,
      location,
      radius,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;
    
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query
    const filterQuery = { isVerified: true };
    
    if (type) {
      filterQuery.type = type;
    }
    
    if (capacity) {
      filterQuery['capacity.passengers'] = { $gte: parseInt(capacity) };
    }
    
    if (features) {
      filterQuery.features = { $all: features.split(',') };
    }
    
    if (includesDriver !== undefined) {
      filterQuery.includesDriver = includesDriver === 'true';
    }
    
    if (minRating) {
      filterQuery.averageRating = { $gte: parseFloat(minRating) };
    }
    
    // Location-based search
    if (location && radius) {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord));
      const radiusInKm = parseFloat(radius);
      
      filterQuery.location = {
        $geoWithin: {
          $centerSphere: [
            [lng, lat],
            radiusInKm / 6371 // Convert km to radians
          ]
        }
      };
    }
    
    // Date filtering
    if (startDate && endDate) {
      filterQuery['availability.unavailableDates'] = {
        $not: {
          $elemMatch: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      };
    }
    
    // Get total count
    const total = await Vehicle.countDocuments(filterQuery);
    
    // Get vehicles with pagination
    const vehicles = await Vehicle.find(filterQuery)
      .sort({ averageRating: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit))
      .populate({
        path: 'ownerId',
        select: 'firstName lastName profileImage',
        model: User
      });
    
    // Calculate pagination details
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: {
        count: vehicles.length,
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        vehicles
      }
    });
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json(
      errorResponse('Server error searching vehicles', 500)
    );
  }
};