import asyncHandler from '../middlewares/async-Handler.js';
import sortPosts, { sortAllPosts } from '../utils/sortPosts.js';
import Post from '../models/postModel.js';
import DraftPost from '../models/draftPostModel.js';
import tagsOptions from '../utils/tagsOptions.js';
import verifyNameExists from '../utils/verifyNameExists.js';
import updateTagsCount from '../utils/updateTagsCount.js';

// @desc Fetch published posts               //descrição
// @route GET /api/post                      //rota
// @access Public                            //acesso (Public, Private, Admin)
const getPosts = asyncHandler(async (req, res) => {
  const { text, sort, pageNumber } = req.query;
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(pageNumber) || 1; //página da url

  //filtrar por: body text
  //ordenar por: createdAt, UpdatedAt
  const keyword = text
    ? {
        ...(text && { body: { $regex: text, $options: 'i' } }),
        stop: false,
      }
    : { stop: false };

  const count = await Post.countDocuments({ ...keyword }); //conta a quantidade de posts

  const posts = await Post.find({ ...keyword })
    .sort(sort ? sortPosts(sort) : { postDate: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  res.json({ posts, page, pages: Math.ceil(count / pageSize) });
});

// @desc Fetch 3 latest published posts
// @route GET /api/posts/last
// @access Public
const getSomePosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ stop: false })
    .sort(sort ? sortPosts(sort) : { postDate: -1 })
    .limit(3);

  res.json(posts);
});

// @desc Fetch all posts
// @route GET /api/post/all
// @access Private/admin
const getAllPosts = asyncHandler(async (req, res) => {
  const { text, stop, sort, pageNumber } = req.query;
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(pageNumber) || 1; //página da url

  //filtrar por: body text, stop (se o blog está publicado)
  //ordenar por: createdAt, UpdatedAt
  const keyword = text
    ? {
        ...(text && { body: { $regex: text, $options: 'i' } }),
        ...(stop && { stop }),
      }
    : {};

  const count = await Post.countDocuments({ ...keyword }); //conta a quantidade de posts

  const posts = await Post.find({ ...keyword })
    .sort(sort ? sortAllPosts(sort) : { stop: 1, postDate: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  res.json({ posts, page, pages: Math.ceil(count / pageSize) });
});

// @desc Create a post
// @route POST /api/post
// @access Private/Admin
const createPost = asyncHandler(async (req, res) => {
  const { id } = req.body; //draft post's id
  const draftPost = await DraftPost.findById(id);

  if (draftPost) {
    const post = new Post({
      name: draftPost.name,
      author: draftPost.author,
      subtopics: draftPost.subtopics,
      tags: draftPost.tags,
      title: draftPost.title,
      subtitle: draftPost.subtitle,
      body: draftPost.body,
      htmlBody: draftPost.htmlBody,
      postDate: new Date(),
      stop: false,
    });
    const createdPost = await post.save();

    updateTagsCount();

    await DraftPost.findByIdAndDelete(draftPost._id);

    return res.status(201).json(createdPost);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Update a post
// @route PUT /api/post/:id
// @access Private/Admin
const updatePost = asyncHandler(async (req, res) => {
  const {
    name,
    subtopics,
    tags: tagsOptions,
    title,
    subtitle,
    body,
    stop,
  } = req.body;
  const tags = [];
  const nameExists = await verifyNameExists(name, req.params.id);

  if (nameExists.statusCode === 400) {
    res.status(400);
    throw new Error(nameExists.message);
  }

  const post = await Post.findOne({
    _id: req.params.id,
  });

  if (tagsOptions.length) {
    //transforma as tagsOptions em _ids para salvar em draftPost
    tagsOptions.map((tag) => tags.push(tag.value));
  }

  if (post) {
    post.name = name;
    post.subtopics = subtopics;
    post.tags = tags;
    post.title = title;
    post.subtitle = subtitle;
    post.body = body;
    post.stop = stop;

    const updatedPost = await post.save();

    updateTagsCount();

    res.status(200).json(updatedPost);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Delete a post
// @route DELETE /api/post/:id
// @access Private/Admin
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });

  if (post) {
    await Post.findByIdAndDelete(post._id);
    updateTagsCount();

    return res
      .status(200)
      .json({ message: `User's post (id: ${post._id}) was deleted.` });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Fetch post by id
// @route GET /api/post/:id
// @access Private/Admin
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'tags',
    select: ['_id', 'name'],
  });
  if (post) {
    return res.json({ post, tagsOptions: tagsOptions(post.tags) });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Fetch post by name
// @route GET /api/post/name/:name
// @access Public
const getPostByName = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ name: req.params.name }).populate({
    path: 'tags',
    select: ['_id', 'name'],
  });
  if (post) {
    return res.json({ post, tagsOptions: tagsOptions(post.tags) });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

export {
  getPosts,
  getAllPosts,
  getSomePosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getPostByName,
};
