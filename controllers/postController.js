import asyncHandler from '../middlewares/async-Handler.js';
import sortPosts from '../utils/sortPosts.js';
import Post from '../models/postModel.js';
import DraftPost from '../models/draftPostModel.js';
import tagsOptions from '../utils/tagsOptions.js';

// @desc Fetch all posts                      //descrição
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
      }
    : {};

  const count = await Post.countDocuments({ ...keyword }); //conta a quantidade de posts

  const posts = await Post.find({ ...keyword })
    .sort(sort ? sortPosts(sort) : { postDate: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  res.json({ posts, page, pages: Math.ceil(count / pageSize) });
});

// @desc Fetch 3 latest posts
// @route GET /api/posts/last
// @access Public
const getSomePosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({})
    .sort(sort ? sortPosts(sort) : { postDate: -1 })
    .limit(3);

  res.json(posts);
});

// @desc Create a post
// @route POST /api/post
// @access Private/Admin
const createPost = asyncHandler(async (req, res) => {
  const { id } = req.body; //draft post's id

  const draftPost = await DraftPost.findOne({
    _id: id,
  });
  if (draftPost) {
    const post = new Post({
      name: draftPost.name,
      subtopics: draftPost.name,
      tags: draftPost.tags,
      title: draftPost.title,
      subtitle: draftPost.subtitle,
      body: draftPost.body,
      author: draftPost.author,
      postDate: new Date(),
    });

    draftPost.posted = true;

    await draftPost.save();
    const createdPost = await post.save();
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
  const { name, subtopics, tags, title, subtitle, body } = req.body;
  const post = await Post.findOne({
    _id: req.params.id,
  });
  if (post) {
    post.name = name;
    post.subtopics = subtopics;
    post.tags = tags;
    post.title = title;
    post.subtitle = subtitle;
    post.body = body;

    const updatedPost = await post.save();
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
  const post = await Post.findById(req.params.id);
  if (post) {
    return res.json(post);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

export {
  getPosts,
  getSomePosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
};
