import express from 'express';
const router = express.Router();
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  createTag,
  deleteTag,
  getTagById,
  getTags,
  updateTag,
} from '../controllers/tagController.js';

router.route('/').get(getTags).post(protect, admin, createTag);

router
  .route('/:id')
  .get(protect, admin, getTagById)
  .put(protect, admin, updateTag)
  .delete(protect, admin, deleteTag);

export default router;
