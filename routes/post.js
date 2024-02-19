import express from 'express';
const router = express.Router();

import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  getPosts,
  getSomePosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
} from '../controllers/postController.js';

router.route('/').post(protect, admin, createPost).get(getPosts);

router.get('/some', getSomePosts);

router
  .route('/:id')
  .get(protect, admin, getPostById)
  .delete(protect, admin, deletePost)
  .put(protect, admin, updatePost);

export default router;
