import Post from '../models/postModel.js';
import Tag from '../models/tagModel.js';

//input: [] de tags
const updateTagsCount = async () => {
  const tags = await Tag.find({});

  if (tags) {
    for (let tag of tags) {
      try {
        const count = await Post.countDocuments({
          tags: { $eq: tag._id },
          stop: false,
        });
        tag.count = count;

        await tag.save();
      } catch (err) {
        console.log(err);
        res.status(400);
        throw new Error('Erro ao atualizar as tags');
      }
    }
    // console.log('As tags foram atualizadas');
  }
};

export default updateTagsCount;
