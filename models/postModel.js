import mongoose from 'mongoose';
import DraftPost from './draftPostModel.js';

const postSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subtopics: [{ name: String, htmlId: String }],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    title: { type: String },
    subtitle: { type: String },
    body: { type: String },
    htmlBody: { type: String },
    postDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

postSchema.post('findOneAndDelete', async function (post) {
  const draftPost = await DraftPost.findOne({ postId: post._id });
  // Remove a associação do rascunho com o post removido
  if (draftPost) {
    await DraftPost.updateOne(
      { postId: post._id },
      {
        posted: false,
        postId: null,
      }
    );
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
