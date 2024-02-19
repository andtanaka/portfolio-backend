const sortOptions = {
  'earliest-first': { postDate: 1 },
  'latest-first': { postDate: -1 },
};

const sortPosts = (typeSort) => {
  return sortOptions[typeSort];
};

export default sortPosts;
