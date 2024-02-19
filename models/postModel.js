import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subtopics: [{ name: String, id: String }],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    title: { type: String },
    subtitle: { type: String },
    body: { type: String },
    postDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
