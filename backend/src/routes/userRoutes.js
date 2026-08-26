import { Router } from 'express';
import { protect as requireAuth } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';

export const userRouter = Router();

userRouter.get('/:id/dashboard', requireAuth, async (req, res, next) => {
  try {
    // Basic auth check
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
});
