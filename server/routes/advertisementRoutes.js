import express from 'express';
import {
  createAdvertisement,
  getAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
} from '../controllers/advertisementController.js';
import { upload, handleMulterError } from '../middleware/upload.js';
import { 
  validateCreateAdvertisement, 
  validateUpdateAdvertisement 
} from '../middleware/validation.js';

const router = express.Router();

// Routes
// GET /api/ads - Get all advertisements with pagination
router.get('/', getAdvertisements);

// GET /api/ads/:id - Get single advertisement
router.get('/:id', getAdvertisement);

// POST /api/ads - Create new advertisement
router.post('/', 
  upload,
  handleMulterError,
  validateCreateAdvertisement,
  createAdvertisement
);

// PUT /api/ads/:id - Update advertisement
router.put('/:id',
  upload,
  handleMulterError,
  validateUpdateAdvertisement,
  updateAdvertisement
);

// DELETE /api/ads/:id - Delete advertisement
router.delete('/:id', deleteAdvertisement);

export default router;
