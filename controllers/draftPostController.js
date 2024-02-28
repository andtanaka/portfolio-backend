import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import asyncHandler from '../middlewares/async-Handler.js';
import sortDraftsPosts from '../utils/sortDraftsPosts.js';
import DraftPost from '../models/draftPostModel.js';
import { marked } from 'marked'; //markdown to html
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
import { v4 as uuidv4 } from 'uuid';
import tagsOptions from '../utils/tagsOptions.js';

// @desc Fetch all drafts                      //descrição
// @route GET /api/post/draft                 //rota
// @access Private/Admin                       //acesso (Public, Private, Admin)
const getDraftsPosts = asyncHandler(async (req, res) => {
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

  const count = await DraftPost.countDocuments({ ...keyword }); //conta a quantidade de posts

  const draftPosts = await DraftPost.find({ ...keyword })
    .sort(sort ? sortDraftsPosts(sort) : { updatedAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  res.json({
    draftPosts,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc Create a draft
// @route POST /api/post/draft
// @access Private/Admin
const createDraftPost = asyncHandler(async (req, res) => {
  const { name, subtopics, tags, title, subtitle, body } = req.body;
  const nameExists = await DraftPost.findOne({ name });

  if (nameExists) {
    res.status(400);
    throw new Error('Esse título já existe');
  }

  const draftPost = new DraftPost({
    name,
    subtopics,
    tags,
    title,
    subtitle,
    body,
    author: req.user._id,
  });

  const createdDraftPost = await draftPost.save();
  return res.status(201).json(createdDraftPost);
});

const parseSubtopics = (body) => {
  const subtopics = [];
  const html = marked.parse(body);
  const dom = new JSDOM(html);

  dom.window.document.querySelectorAll('h3').forEach((el) => {
    const htmlId = uuidv4();
    el.setAttribute('id', htmlId);

    subtopics.push({
      name: el.textContent,
      htmlId,
    });
  });

  return {
    htmlBody: dom.serialize(),
    subtopics,
  };
};

// @desc Update a draft
// @route PUT /api/post/draft/:id
// @access Private/Admin
const updateDraftPost = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { name, tags: tagsOptions, title, subtitle, body } = req.body;
  const tags = [];
  const draftPost = await DraftPost.findOne({
    _id: req.params.id,
    author: userId, //apenas o author poderá editar o post
  });
  const nameExists = await DraftPost.findOne({ name });

  if (nameExists) {
    if (nameExists._id.toString() !== draftPost._id.toString()) {
      //se o nome existir e não for do mesmmo _id
      res.status(400);
      throw new Error('Esse título já existe');
    }
  }

  console.log(tagsOptions);

  if (tagsOptions.length) {
    //transforma as tagsOptions em _ids para salvar em draftPost
    tagsOptions.map((tag) => tags.push(tag.value));
  }

  if (draftPost) {
    draftPost.name = name;
    draftPost.tags = tags;
    draftPost.title = title;
    draftPost.subtitle = subtitle;

    //parse dos subtopics
    if (body) {
      const { htmlBody, subtopics } = parseSubtopics(body);
      draftPost.body = body;
      draftPost.subtopics = subtopics;
      draftPost.htmlBody = htmlBody;
    }
    console.log(draftPost);

    const updatedDraftPost = await draftPost.save();
    res.status(200).json(updatedDraftPost);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Delete a draft
// @route DELETE /api/post/draft/:id
// @access Private/Admin
const deleteDraftPost = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { id } = req.params;
  const post = await DraftPost.findOne({
    _id: id,
    author: userId,
  }); //apenas o author poderá apagar o post

  if (post) {
    await DraftPost.findByIdAndDelete(post._id);
    return res
      .status(200)
      .json({ message: `User's post (id: ${id}) was deleted.` });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Fetch draft by id
// @route GET /api/post/draft/:id
// @access Private/Admin
const getDraftPostById = asyncHandler(async (req, res) => {
  const post = await DraftPost.findById(req.params.id);
  if (post) {
    return res.json({ post });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Fetch draft by name
// @route GET /api/post/draft/:name
// @access Private/Admin
const getDraftPostByName = asyncHandler(async (req, res) => {
  const post = await DraftPost.findOne({ name: req.params.name }).populate({
    path: 'tags',
    select: ['_id', 'name'],
  });
  if (post) {
    // console.log(post);
    return res.json({ post, tagsOptions: tagsOptions(post.tags) });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

export {
  getDraftsPosts,
  createDraftPost,
  updateDraftPost,
  deleteDraftPost,
  getDraftPostById,
  getDraftPostByName,
};
