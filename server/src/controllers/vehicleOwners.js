const VehicleOwner = require('../models/VehicleOwner');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinary');
const errorResponse = require('../utils/errorResponse');

/**
 * @desc    Get vehicle owner profile
 * @route   GET /api/vehicle-owners/profile
 * @access  Private (Vehicle Owner only)
 */
exports.getVehicleOwnerProfile = async (req, res) => {
  try {
    // Check if user is a vehicle owner
    if (req.user.role !== 'vehicleOwner') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a vehicle owner', 403)
      );
    }

    // Find vehicle owner profile
    const vehicleOwner = await VehicleOwner.findOne({ userId: req.user._id });

    if (!vehicleOwner) {
      return res.status(404).json(
        errorResponse('Vehicle owner profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { vehicleOwner }
    });
  } catch (error) {
    console.error('Error getting vehicle owner profile:', error);
    res.status(500).json(
      errorResponse('Server error retrieving vehicle owner profile', 500)
    );
  }
};

/**
 * @desc    Update vehicle owner profile
 * @route   PUT /api/vehicle-owners/profile
 * @access  Private (Vehicle Owner only)
 */
exports.updateVehicleOwnerProfile = async (req, res) => {
  try {
    // Check if user is a vehicle owner
    if (req.user.role !== 'vehicleOwner') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a vehicle owner', 403)
      );
    }

    const {
      nic,
      businessName,
      businessRegistrationNumber,
      address,
      operatingAreas,
      bio
    } = req.body;

    // Fields to update
    const updateFields = {};

    if (nic) updateFields.nic = nic;
    if (businessName) updateFields.businessName = businessName;
    if (businessRegistrationNumber) updateFields.businessRegistrationNumber = businessRegistrationNumber;
    if (address) {
      if (address.street) updateFields['address.street'] = address.street;
      if (address.city) updateFields['address.city'] = address.city;
      if (address.state) updateFields['address.state'] = address.state;
      if (address.postalCode) updateFields['address.postalCode'] = address.postalCode;
      if (address.country) updateFields['address.country'] = address.country;
    }
    if (operatingAreas) updateFields.operatingAreas = operatingAreas;
    if (bio) updateFields.bio = bio;

    // Update vehicle owner profile
    const vehicleOwner = await VehicleOwner.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!vehicleOwner) {
      return res.status(404).json(
        errorResponse('Vehicle owner profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { vehicleOwner }
    });
  } catch (error) {
    console.error('Error updating vehicle owner profile:', error);
    res.status(500).json(
      errorResponse('Server error updating vehicle owner profile', 500)
    );
  }
};

/**
 * @desc    Upload verification documents
 * @route   POST /api/vehicle-owners/verification-documents
 * @access  Private (Vehicle Owner only)
 */
exports.uploadVerificationDocuments = async (req, res) => {
  try {
    // Check if user is a vehicle owner
    if (req.user.role !== 'vehicleOwner') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a vehicle owner', 403)
      );
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(
        errorResponse('Please upload at least one document', 400)
      );
    }

    // Upload files to Cloudinary
    const uploadPromises = req.files.map(file => {
      return cloudinaryService.uploadFile(
        file.path,
        'sri-lanka-tourism/vehicle-owners/verification-documents',
        {
          resource_type: 'auto',
          public_id: `vehicle_owner_${req.user._id}_${Date.now()}`
        }
      );
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Format document data
    const documents = uploadResults.map((result, index) => ({
      type: String, // URL to stored document
      description: req.body.descriptions ? req.body.descriptions[index] : 'Verification document'
    }));

    // Add documents to vehicle owner profile
    const vehicleOwner = await VehicleOwner.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { verificationDocuments: { $each: documents } } },
      { new: true }
    );

    if (!vehicleOwner) {
      return res.status(404).json(
        errorResponse('Vehicle owner profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        documents: vehicleOwner.verificationDocuments
      }
    });
  } catch (error) {
    console.error('Error uploading verification documents:', error);
    res.status(500).json(
      errorResponse('Server error uploading verification documents', 500)
    );
  }
};

/**
 * @desc    Submit profile for verification
 * @route   POST /api/vehicle-owners/submit-verification
 * @access  Private (Vehicle Owner only)
 */
exports.submitForVerification = async (req, res) => {
  try {
    // Check if user is a vehicle owner
    if (req.user.role !== 'vehicleOwner') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a vehicle owner', 403)
      );
    }
    
    const vehicleOwner = await VehicleOwner.findOne({ userId: req.user._id });
    
    if (!vehicleOwner) {
      return res.status(404).json(
        errorResponse('Vehicle owner profile not found', 404)
      );
    }
    
    // Check if vehicle owner has submitted required information
    if (!vehicleOwner.businessName || !vehicleOwner.nic || vehicleOwner.verificationDocuments.length === 0) {
      return res.status(400).json(
        errorResponse('Please complete your profile with business name, NIC, and verification documents before submitting for verification', 400)
      );
    }
    
    // Update verification status to pending
    vehicleOwner.verificationStatus = 'pending';
    await vehicleOwner.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Your profile has been submitted for verification. You will be notified once the process is complete.',
      data: {
        verificationStatus: vehicleOwner.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error submitting vehicle owner for verification:', error);
    res.status(500).json(
      errorResponse('Server error submitting for verification', 500)
    );
  }
};

/**
 * @desc    Get list of vehicle owners
 * @route   GET /api/vehicle-owners
 * @access  Public
 */
exports.getVehicleOwners = async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skipIndex = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = { isVerified: true }; // Only return verified vehicle owners
    
    if (req.query.operatingAreas) {
      filterQuery.operatingAreas = { $in: req.query.operatingAreas.split(',') };
    }
    
    if (req.query.minRating) {
      filterQuery.averageRating = { $gte: parseFloat(req.query.minRating) };
    }
    
    // Get total count
    const total = await VehicleOwner.countDocuments(filterQuery);
    
    // Get vehicle owners with pagination
    const vehicleOwners = await VehicleOwner.find(filterQuery)
      .sort({ averageRating: -1 }) // Sort by rating (highest first)
      .skip(skipIndex)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'firstName lastName profileImage',
        model: User
      });
    
    // Calculate pagination details
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      status: 'success',
      data: {
        count: vehicleOwners.length,
        total,
        pagination: {
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        vehicleOwners
      }
    });
  } catch (error) {
    console.error('Error getting vehicle owners:', error);
    res.status(500).json(
      errorResponse('Server error retrieving vehicle owners', 500)
    );
  }
};

/**
 * @desc    Get vehicle owner by ID
 * @route   GET /api/vehicle-owners/:id
 * @access  Public
 */
exports.getVehicleOwnerById = async (req, res) => {
  try {
    const vehicleOwner = await VehicleOwner.findOne({ 
      userId: req.params.id,
      isVerified: true
    }).populate({
      path: 'userId',
      select: 'firstName lastName profileImage',
      model: User
    });
    
    if (!vehicleOwner) {
      return res.status(404).json(
        errorResponse('Vehicle owner not found or not verified', 404)
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: { vehicleOwner }
    });
  } catch (error) {
    console.error('Error getting vehicle owner by ID:', error);
    res.status(500).json(
      errorResponse('Server error retrieving vehicle owner', 500)
    );
  }
};