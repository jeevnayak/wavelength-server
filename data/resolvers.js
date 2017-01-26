var models = require("./models");
var Sequelize = require("sequelize");

var resolvers = {
  Query: {
    user(_, args) {
      return models.User.findById(args.id);
    },
  },
  User: {
    partnerships(obj) {
      return models.Partnership.findAll({
        where: {
          $or: {
            user1Id: obj.id,
            user2Id: obj.id
          }
        }
      })
    },
  },
  Partnership: {
    users(obj) {
      return models.User.findAll({
        where: {
          id: {
            $in: [obj.user1Id, obj.user2Id]
          }
        }
      });
    },
    games(obj) {
      return obj.getGames();
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
    newGame(_, args) {
      var user1Id = (args.cluerId < args.guesserId) ?
        args.cluerId : args.guesserId;
      var user2Id = (args.cluerId < args.guesserId) ?
        args.guesserId : args.cluerId;
      return models.Partnership.findOne({
        where: {
          user1Id: user1Id,
          user2Id: user2Id
        }
      }).then(function(partnership) {
        var createGame = function(partnership) {
          return models.Game.create({
            word: "EXAMPLE",
            cluerId: args.cluerId,
            partnershipId: partnership.id
          });
        };

        if (partnership) {
          return createGame(partnership);
        } else {
          return models.Partnership.create({
            user1Id: user1Id,
            user2Id: user2Id
          }).then(function(partnership) {
            return createGame(partnership);
          });
        }
      });
    },
  }
};

module.exports = resolvers
