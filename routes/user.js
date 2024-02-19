import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  deleteProfile,
  updateUserPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

router.route('/').post(registerUser).get(protect, admin, getUsers);

router.post('/login', authUser);
router.post('/logout', protect, logoutUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteProfile);

router.put('/profile/password', protect, updateUserPassword);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;
