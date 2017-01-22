var resolvers = {
  Query: {
    user(obj, args, context, info) {
      return {
        id: args.id,
        name: "Rajeev Nayak",
        firstName: "Rajeev",
        lastName: "Nayak"
      };
    },
  },
};

module.exports = resolvers
