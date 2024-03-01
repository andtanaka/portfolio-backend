import mongoose from 'mongoose';

const draftPostSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
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
  },
  {
    timestamps: true,
  }
);

draftPostSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Esse título já existe.'));
  } else {
    next();
  }
});

draftPostSchema.post('update', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Esse título já existe.'));
  } else {
    next();
  }
});

const DraftPost = mongoose.model('DraftPost', draftPostSchema);

export default DraftPost;
