const sortOptions = {
  'earliest-first': { createdAt: -1 },
  'latest-first': { createdAt: 1 },
  'earliestUpdated-first': { updatedAt: -1 },
  'latestUpdated-first': { updatedAt: 1 },
};

const sortDraftsPosts = (typeSort) => {
  return sortOptions[typeSort];
};

export default sortDraftsPosts;
