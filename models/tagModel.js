import mongoose from 'mongoose';
import Post from './postModel.js';
import DraftPost from './draftPostModel.js';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

tagSchema.post('findOneAndDelete', async function (tag) {
  const draftPosts = await DraftPost.find({ tags: tag._id });
  // Remove a tag excluída de DraftPosts
  if (draftPosts.length) {
    for (let draftPost of draftPosts) {
      const { _id } = draftPost;
      await DraftPost.updateOne(
        { _id },
        {
          $pullAll: {
            tags: [{ _id: tag._id }],
          },
        }
      );
    }
  }
});

tagSchema.post('findOneAndDelete', async function (tag) {
  const posts = await Post.find({ tags: tag._id });
  // Remove a tag excluída de Posts
  if (posts.length) {
    for (let post of posts) {
      const { _id } = post;
      await Post.updateOne(
        { _id },
        {
          $pullAll: {
            tags: [{ _id: tag._id }],
          },
        }
      );
    }
  }
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
