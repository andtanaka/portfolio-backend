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
  getAllPosts,
  getPostByName,
} from '../controllers/postController.js';

router.route('/').post(protect, admin, createPost).get(getPosts);
router.route('/all').get(protect, getAllPosts);

router.get('/some', getSomePosts);

router.get('/name/:name', getPostByName);

router
  .route('/:id')
  .get(protect, admin, getPostById)
  .delete(protect, admin, deletePost)
  .put(protect, admin, updatePost);

export default router;
