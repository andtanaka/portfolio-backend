import express from 'express';
const router = express.Router();

import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  createDraftPost,
  createDraftPostFromPost,
  deleteDraftPost,
  getDraftPostById,
  getDraftsPosts,
  updateDraftPost,
} from '../controllers/draftPostController.js';

router
  .route('/')
  .post(protect, admin, createDraftPost)
  .get(protect, admin, getDraftsPosts);

router
  .route('/:id')
  .post(protect, admin, createDraftPostFromPost)
  .get(protect, admin, getDraftPostById)
  .delete(protect, admin, deleteDraftPost)
  .put(protect, admin, updateDraftPost);

export default router;
