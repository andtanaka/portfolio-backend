const sortOptions = {
  'earliest-first': { postDate: -1 },
  'latest-first': { postDate: 1 },
};

const sortAllOptions = {
  'earliest-first': { postDate: -1 },
  'latest-first': { postDate: 1 },
  'earliestUpdated-first': { updatedAt: -1 },
  'latestUpdated-first': { updatedAt: 1 },
};

const sortPosts = (typeSort) => {
  return sortOptions[typeSort];
};

const sortAllPosts = (typeSort) => {
  return sortAllOptions[typeSort];
};

export default sortPosts;

export { sortAllPosts };
