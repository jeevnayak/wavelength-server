var models = require("./models");
var Sequelize = require("sequelize");

var resolvers = {
  Query: {
    user(_, args) {
      return models.User.findById(args.id);
    },
    partnership(_, args) {
      return models.Partnership.findById(args.id);
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
    partner(obj, args) {
      var partnerId = (obj.user1Id === args.userId) ? obj.user2Id : obj.user1Id;
      return models.User.findById(partnerId);
    },
    games(obj) {
      return obj.getGames();
    },
  },
  Game: {
    isCluer(obj, args) {
      return obj.cluerId === args.userId;
    },
    clues(obj) {
      return obj.clues ? obj.clues.split(",") : [];
    },
    guesses(obj) {
      return obj.guesses ? obj.guesses.split(",") : [];
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
    giveClues(_, args) {
      return models.Game.findById(args.gameId).then(function(game) {
        return game.update({
          clues: args.clues.join(",")
        });
      });
    },
    makeGuesses(_, args) {
      return models.Game.findById(args.gameId).then(function(game) {
        return game.update({
          guesses: args.guesses.join(",")
        });
      });
    },
  }
};

module.exports = resolvers
