var Sequelize = require("sequelize");

var dailyChallenge = require("../util/dailyChallenge");
var models = require("./models");
var notifications = require("../notifications");
var words = require("./words");

var resolvers = {
  Query: {
    user(_, args) {
      return models.User.findById(args.id);
    },
    partnership(_, args) {
      return models.Partnership.findById(args.id);
    },
    game(_, args) {
      return models.Game.findById(args.id);
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
    dailyChallengeInfo(obj) {
      return {
        userId: obj.id
      }
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
      return obj.clues || [];
    },
    guesses(obj) {
      return obj.guesses || [];
    },
  },
  DailyChallengeInfo: {
    incomingRequests(obj) {
      return models.DailyChallengeRequest.findAll({
        where: {
          $and: {
            date: dailyChallenge.getCurrentDateStr(),
            toUserId: obj.userId
          }
        }
      })
    },
    outgoingRequests(obj) {
      return models.DailyChallengeRequest.findAll({
        where: {
          $and: {
            date: dailyChallenge.getCurrentDateStr(),
            fromUserId: obj.userId
          }
        }
      })
    },
    games(obj) {
      return models.DailyChallengeEntry.findOne({
        where: {
          $and: {
            date: dailyChallenge.getCurrentDateStr(),
            $or: {
              user1Id: obj.userId,
              user2Id: obj.userId
            }
          }
        }
      }).then(function(entry) {
        if (entry) {
          return models.Game.findAll({
            where: {
              id: {
                $in: [entry.game1Id, entry.game2Id]
              }
            }
          });
        } else {
          return [];
        }
      })
    },
  },
  DailyChallengeRequest: {
    partner(obj, args) {
      var partnerId = (obj.fromUserId === args.userId) ?
        obj.toUserId : obj.fromUserId;
      return models.User.findById(partnerId);
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
    addPushToken(_, args) {
      return models.User.findById(args.userId).then(function(user) {
        if (user.pushTokens && user.pushTokens.includes(args.pushToken)) {
          return user;
        } else {
          return user.update({
            pushTokens: user.pushTokens ?
              user.pushTokens.concat([args.pushToken]) : [args.pushToken]
          });
        }
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
            word: words[Math.floor(Math.random() * words.length)],
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
        return game.update({clues: args.clues}).then(function(game) {
          notifications.notifyCluesGiven(game);
          return game;
        });
      });
    },
    makeGuesses(_, args) {
      return models.Game.findById(args.gameId).then(function(game) {
        return game.update({guesses: args.guesses}).then(function(game) {
          notifications.notifyGuessesMade(game);
          return game;
        });
      });
    },
    sendDailyChallengeRequest(_, args) {
      return models.DailyChallengeRequest.create({
        date: dailyChallenge.getCurrentDateStr(),
        fromUserId: args.fromUserId,
        toUserId: args.toUserId
      });
    },
    acceptDailyChallengeRequest(_, args) {
      return models.DailyChallengeRequest.findById(args.requestId).then(
        function(request) {
          var user1Id = (request.fromUserId < request.toUserId) ?
            request.fromUserId : request.toUserId;
          var user2Id = (request.fromUserId < request.toUserId) ?
            request.toUserId : request.fromUserId;
          return models.Partnership.findOne({
            where: {
              user1Id: user1Id,
              user2Id: user2Id
            }
          }).then(function(partnership) {
            var createGames = function(partnership) {
              var words = dailyChallenge.getWordsForDate(request.date);
              return Sequelize.Promise.all([
                models.Game.create({
                  word: words[0],
                  cluerId: user1Id,
                  partnershipId: partnership.id
                }),
                models.Game.create({
                  word: words[1],
                  cluerId: user2Id,
                  partnershipId: partnership.id
                })
              ]).spread(function(game1, game2) {
                return models.DailyChallengeEntry.create({
                  date: request.date,
                  user1Id: user1Id,
                  user2Id: user2Id,
                  game1Id: game1.id,
                  game2Id: game2.id
                }).then(function(entry) {
                  return [game1, game2];
                });
              });
            };

            if (partnership) {
              return createGames(partnership);
            } else {
              return models.Partnership.create({
                user1Id: user1Id,
                user2Id: user2Id
              }).then(function(partnership) {
                return createGames(partnership);
              });
            }
          });
        });
    },
  }
};

module.exports = resolvers
