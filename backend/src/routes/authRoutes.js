import { Router } from 'express';
import { registerUser, loginUser, getMe, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/me', protect, getMe);
authRouter.post('/logout', logoutUser);
