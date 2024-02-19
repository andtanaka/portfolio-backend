import asyncHandler from '../middlewares/async-Handler.js';
import Tag from '../models/tagModel.js';
import sortTags from '../utils/sortTags.js';

// @desc Fetch all tags                      //descrição
// @route GET /api/tag                      //rota
// @access Public                            //acesso (Public, Private, Admin)
const getTags = asyncHandler(async (req, res) => {
  const { name, sort } = req.query;

  //filtrar por: name
  //ordenar por: UpdatedAt
  const keyword = name
    ? {
        ...(name && { name: { $regex: name, $options: 'i' } }),
      }
    : {};

  const tags = await Tag.find({ ...keyword }).sort(
    sort ? sortTags(sort) : { updatedAt: -1 }
  );

  res.json(tags);
});

// @desc Create a tag
// @route POST /api/tag
// @access Private/Admin
const createTag = asyncHandler(async (req, res) => {
  const tag = new Tag({
    name: req.body.name,
  });

  const createdTag = await tag.save();
  return res.status(201).json(createdTag);
});

// @desc Update a tag
// @route PUT /api/tag/:id
// @access Private/Admin
const updateTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({
    _id: req.params.id,
  });
  if (tag) {
    tag.name = req.body.name;

    const updatedTag = await tag.save();
    res.status(200).json(updatedTag);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Delete a tag
// @route DELETE /api/tag/:id
// @access Private/Admin
const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ _id: req.params.id });

  if (tag) {
    await Tag.findByIdAndDelete(tag._id);
    return res
      .status(200)
      .json({ message: `User's tag (id: ${tag._id}) was deleted.` });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Fetch tag
// @route GET /api/tag/:id
// @access Private/Admin
const getTagById = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (tag) {
    return res.json(tag);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

export { getTags, createTag, deleteTag, updateTag, getTagById };
