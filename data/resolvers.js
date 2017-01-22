var models = require("./models");

var resolvers = {
  Query: {
    user(_, args) {
      return models.User.findById(args.id);
    },
  },
  Mutation: {
    updateUser(_, args) {
      return models.User.findById(args.id).then(function(user) {
        if (!user) {
          user = models.User.build({id: args.id});
        }
        return user.update(args);
      });
    },
  },
};

module.exports = resolvers
