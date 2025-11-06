import express from 'express';
import { registerUser, loginUser, getUserBalance, getUserProfile } from '../controller/userController.js';
import { protect } from '../authentication/auth.js'; 

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Private routes (require authentication)
router.get('/balance', protect, getUserBalance);

export default router;
