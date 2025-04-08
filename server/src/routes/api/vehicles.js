const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const vehiclesController = require('../../controllers/vehicles');
const { protect, authorize } = require('../../middleware/auth');
const validationMiddleware = require('../../middleware/validation');
const { uploadMultipleImages } = require('../../middleware/upload');

// Public routes
router.get('/search', vehiclesController.searchVehicles);
router.get('/:id', vehiclesController.getVehicleById);

// Protected routes
router.use(protect);

// Vehicle owner only routes
router.post(
  '/',
  [
    authorize('vehicleOwner'),
    body('type').isIn(['car', 'van', 'suv', 'bus', 'motorcycle', 'tuk-tuk', 'bicycle', 'other']).withMessage('Invalid vehicle type'),
    body('make').notEmpty().withMessage('Vehicle make is required'),
    body('model').notEmpty().withMessage('Vehicle model is required'),
    body('year').isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Invalid year'),
    body('registrationNumber').notEmpty().withMessage('Registration number is required'),
    body('capacity.passengers').isInt({ min: 1 }).withMessage('Passenger capacity must be at least 1'),
    validationMiddleware
  ],
  vehiclesController.registerVehicle
);

router.get('/my-vehicles', authorize('vehicleOwner'), vehiclesController.getMyVehicles);

router.put(
  '/:id',
  [
    authorize('vehicleOwner'),
    body('type').optional().isIn(['car', 'van', 'suv', 'bus', 'motorcycle', 'tuk-tuk', 'bicycle', 'other']).withMessage('Invalid vehicle type'),
    body('make').optional().notEmpty().withMessage('Vehicle make cannot be empty'),
    body('model').optional().notEmpty().withMessage('Vehicle model cannot be empty'),
    body('year').optional().isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Invalid year'),
    body('registrationNumber').optional().notEmpty().withMessage('Registration number cannot be empty'),
    body('capacity.passengers').optional().isInt({ min: 1 }).withMessage('Passenger capacity must be at least 1'),
    validationMiddleware
  ],
  vehiclesController.updateVehicle
);

router.delete('/:id', authorize('vehicleOwner'), vehiclesController.deleteVehicle);

router.post(
  '/:id/photos',
  authorize('vehicleOwner'),
  uploadMultipleImages('photos', 10),
  vehiclesController.uploadVehiclePhotos
);

router.post(
  '/:id/submit-verification',
  authorize('vehicleOwner'),
  vehiclesController.submitForVerification
);

module.exports = router;