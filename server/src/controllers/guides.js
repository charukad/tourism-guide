const Guide = require('../models/Guide');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinary');
const errorResponse = require('../utils/errorResponse');

/**
 * @desc    Get guide profile
 * @route   GET /api/guides/profile
 * @access  Private (Guide only)
 */
exports.getGuideProfile = async (req, res) => {
  try {
    // Check if user is a guide
    if (req.user.role !== 'guide') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a guide', 403)
      );
    }

    // Find guide profile
    const guide = await Guide.findOne({ userId: req.user._id });

    if (!guide) {
      return res.status(404).json(
        errorResponse('Guide profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { guide }
    });
  } catch (error) {
    console.error('Error getting guide profile:', error);
    res.status(500).json(
      errorResponse('Server error retrieving guide profile', 500)
    );
  }
};

/**
 * @desc    Update guide profile
 * @route   PUT /api/guides/profile
 * @access  Private (Guide only)
 */
exports.updateGuideProfile = async (req, res) => {
  try {
    // Check if user is a guide
    if (req.user.role !== 'guide') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a guide', 403)
      );
    }

    const {
      nic,
      licenseNumber,
      licenseExpiry,
      expertise,
      languages,
      experience,
      bio,
      serviceAreas,
      rates
    } = req.body;

    // Fields to update
    const updateFields = {};

    if (nic) updateFields.nic = nic;
    if (licenseNumber) updateFields.licenseNumber = licenseNumber;
    if (licenseExpiry) updateFields.licenseExpiry = licenseExpiry;
    if (expertise) updateFields.expertise = expertise;
    if (languages) updateFields.languages = languages;
    if (experience !== undefined) updateFields.experience = experience;
    if (bio) updateFields.bio = bio;
    if (serviceAreas) updateFields.serviceAreas = serviceAreas;
    if (rates) {
      if (rates.hourly) updateFields['rates.hourly'] = rates.hourly;
      if (rates.daily) updateFields['rates.daily'] = rates.daily;
      if (rates.currency) updateFields['rates.currency'] = rates.currency;
    }

    // Update guide profile
    const guide = await Guide.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!guide) {
      return res.status(404).json(
        errorResponse('Guide profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { guide }
    });
  } catch (error) {
    console.error('Error updating guide profile:', error);
    res.status(500).json(
      errorResponse('Server error updating guide profile', 500)
    );
  }
};

/**
 * @desc    Upload verification documents
 * @route   POST /api/guides/verification-documents
 * @access  Private (Guide only)
 */
exports.uploadVerificationDocuments = async (req, res) => {
  try {
    // Check if user is a guide
    if (req.user.role !== 'guide') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a guide', 403)
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
        'sri-lanka-tourism/guides/verification-documents',
        {
          resource_type: 'auto',
          public_id: `guide_${req.user._id}_${Date.now()}`
        }
      );
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Format document data
    const documents = uploadResults.map((result, index) => ({
      type: String, // URL to stored document
      description: req.body.descriptions ? req.body.descriptions[index] : 'Verification document'
    }));

    // Add documents to guide profile
    const guide = await Guide.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { verificationDocuments: { $each: documents } } },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json(
        errorResponse('Guide profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        documents: guide.verificationDocuments
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
 * @desc    Update guide availability
 * @route   PUT /api/guides/availability
 * @access  Private (Guide only)
 */
exports.updateAvailability = async (req, res) => {
  try {
    // Check if user is a guide
    if (req.user.role !== 'guide') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a guide', 403)
      );
    }

    const {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      unavailableDates
    } = req.body;

    // Fields to update
    const updateFields = {};

    if (monday !== undefined) updateFields['availability.monday'] = monday;
    if (tuesday !== undefined) updateFields['availability.tuesday'] = tuesday;
    if (wednesday !== undefined) updateFields['availability.wednesday'] = wednesday;
    if (thursday !== undefined) updateFields['availability.thursday'] = thursday;
    if (friday !== undefined) updateFields['availability.friday'] = friday;
    if (saturday !== undefined) updateFields['availability.saturday'] = saturday;
    if (sunday !== undefined) updateFields['availability.sunday'] = sunday;
    if (unavailableDates) updateFields['availability.unavailableDates'] = unavailableDates;

    // Update guide availability
    const guide = await Guide.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json(
        errorResponse('Guide profile not found', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        availability: guide.availability
      }
    });
  } catch (error) {
    console.error('Error updating guide availability:', error);
    res.status(500).json(
      errorResponse('Server error updating guide availability', 500)
    );
  }
};

/**
 * @desc    Get list of guides
 * @route   GET /api/guides
 * @access  Public
 */
exports.getGuides = async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skipIndex = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = { isVerified: true }; // Only return verified guides
    
    if (req.query.expertise) {
      filterQuery.expertise = { $in: req.query.expertise.split(',') };
    }
    
    if (req.query.languages) {
      filterQuery.languages = { $in: req.query.languages.split(',') };
    }
    
    if (req.query.serviceAreas) {
      filterQuery.serviceAreas = { $in: req.query.serviceAreas.split(',') };
    }
    
    if (req.query.minRating) {
      filterQuery.averageRating = { $gte: parseFloat(req.query.minRating) };
    }
    
    // Get total count
    const total = await Guide.countDocuments(filterQuery);
    
    // Get guides with pagination
    const guides = await Guide.find(filterQuery)
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
        count: guides.length,
        total,
        pagination: {
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        guides
      }
    });
  } catch (error) {
    console.error('Error getting guides:', error);
    res.status(500).json(
      errorResponse('Server error retrieving guides', 500)
    );
  }
};

/**
 * @desc    Get guide by ID
 * @route   GET /api/guides/:id
 * @access  Public
 */
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findOne({ 
      userId: req.params.id,
      isVerified: true
    }).populate({
      path: 'userId',
      select: 'firstName lastName profileImage',
      model: User
    });
    
    if (!guide) {
      return res.status(404).json(
        errorResponse('Guide not found or not verified', 404)
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: { guide }
    });
  } catch (error) {
    console.error('Error getting guide by ID:', error);
    res.status(500).json(
      errorResponse('Server error retrieving guide', 500)
    );
  }
};

/**
 * @desc    Submit guide profile for verification
 * @route   POST /api/guides/submit-verification
 * @access  Private (Guide only)
 */
exports.submitForVerification = async (req, res) => {
  try {
    // Check if user is a guide
    if (req.user.role !== 'guide') {
      return res.status(403).json(
        errorResponse('Access denied. User is not a guide', 403)
      );
    }
    
    const guide = await Guide.findOne({ userId: req.user._id });
    
    if (!guide) {
      return res.status(404).json(
        errorResponse('Guide profile not found', 404)
      );
    }
    
    // Check if guide has submitted required information
    if (!guide.licenseNumber || !guide.nic || guide.verificationDocuments.length === 0) {
      return res.status(400).json(
        errorResponse('Please complete your profile with license number, NIC, and verification documents before submitting for verification', 400)
      );
    }
    
    // Update verification status to pending
    guide.verificationStatus = 'pending';
    await guide.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Your profile has been submitted for verification. You will be notified once the process is complete.',
      data: {
        verificationStatus: guide.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error submitting guide for verification:', error);
    res.status(500).json(
      errorResponse('Server error submitting for verification', 500)
    );
  }
};