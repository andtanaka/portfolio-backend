import mongoose from 'mongoose';

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
    stop: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
