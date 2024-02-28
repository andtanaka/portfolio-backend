//usado no select do frontend

const tagsOptions = (tags) => {
  //retorna [...{value, label}]

  return [
    ...tags.map((tag) => {
      return { value: tag._id, label: tag.name };
    }),
  ];
};

export default tagsOptions;
