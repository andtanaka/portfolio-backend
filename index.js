import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (process.env.NODE_ENV !== 'production') {
  //quando NODE_ENV = development, usamos o arquivo .env na nossa aplicação
  require('dotenv').config();
}

import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/user.js';
import draftPostRoutes from './routes/draftPost.js';
import postRoutes from './routes/post.js';
import tagRoutes from './routes/tag.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

const cors = require('cors');

const port = process.env.PORT || 5001;

connectDB(); //Conexão com o MongoDB

const app = express();

//body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie parser middleware
app.use(cookieParser());

const corsOptions = {
  origin: [
    'https://portfolio-amtanaka.vercel.app',
    'https://portfolio-blog-admin.vercel.app',
  ],
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Content-Type, *',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  return res.status(200).json('Welcome, the app is working well');
});

app.use('/api/user', userRoutes);
app.use('/api/post/draft', draftPostRoutes);
app.use('/api/post', postRoutes);
app.use('/api/tag', tagRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
