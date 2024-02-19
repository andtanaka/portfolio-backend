import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

import connectDB from './config/db.js';
import userRoutes from './routes/user.js';
import draftPostRoutes from './routes/draftPost.js';
import postRoutes from './routes/post.js';
import tagRoutes from './routes/tag.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

const port = process.env.PORT || 5001;

connectDB(); //Conexão com o MongoDB

const app = express();

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie parser middleware
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/post/draft', draftPostRoutes);
app.use('/api/post', postRoutes);
app.use('/api/tag', tagRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
