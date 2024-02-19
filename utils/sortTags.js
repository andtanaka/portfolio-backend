const sortOptions = {
  'earliest-first': { updatedAt: 1 },
  'latest-first': { updatedAt: -1 },
};

const sortTags = (typeSort) => {
  return sortOptions[typeSort];
};

export default sortTags;
