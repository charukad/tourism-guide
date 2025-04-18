const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  uploadProfileImage,
  getProfileImages,
  deleteProfileImage,
  cleanupDuplicateImages
} = require('../controllers/profileImageController');

router.post('/image', protect, uploadProfileImage);
router.get('/images', protect, getProfileImages);
router.delete('/image/:id', protect, deleteProfileImage);
router.get('/cleanup', protect, cleanupDuplicateImages);

module.exports = router; 