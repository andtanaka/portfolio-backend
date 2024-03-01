import DraftPost from '../models/draftPostModel.js';
import Post from '../models/postModel.js';

//id opcional:
//  - quando estamos editando um rascunho, e não alteramos o "name", "inDraftPosts" poderá conter o próprio elemento editado. Dessa forma, se "inDraftPosts" tiver o _id diferente do comparado é porque não é ele mesmo. Ou seja, já existe um rascunho de mesmo "name".
//  - quando estamos criando um novo rascunho, ele não tem um _id ainda. Por isso que esse campo é opcional

//Verifica o name de draftpost
const verifyNameExists = async (name, id = null) => {
  const inDraftPosts = await DraftPost.findOne({ name });
  const inPosts = await Post.findOne({ name });

  const response = {
    statusCode: 200,
    message: "Ok. Draftpost's name is not exists",
  };

  if (id) {
    if (inDraftPosts) {
      if (inDraftPosts._id.toString() !== id.toString()) {
        response.statusCode = 400;
        response.message = 'Já tem um rascunho com esse título';
      }
    }
    if (inPosts) {
      if (inPosts._id.toString() !== id.toString()) {
        response.statusCode = 400;
        response.message = 'Já tem um post com esse título';
      }
    }
  } else {
    if (inDraftPosts) {
      response.statusCode = 400;
      response.message = 'Já tem um rascunho com esse título';
    }
    if (inPosts) {
      response.statusCode = 400;
      response.message = 'Já tem um post com esse título';
    }
  }

  return response;
};

export default verifyNameExists;
