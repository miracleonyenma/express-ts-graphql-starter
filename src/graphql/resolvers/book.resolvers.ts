const bookResolvers = {
  Query: {
    books: async (parent, args, context, info) => {
      return [
        {
          title: "The Awakening",
        },
        {
          title: "City of Glass",
        },
      ];
    },
  },
};

export default bookResolvers;
