var Sequelize = require("sequelize");

var dailyChallenge = require("../util/dailyChallenge");
var db = require("./db");
var notifications = require("../notifications");
var words = require("./words");

var resolvers = {
  Query: {
    user(_, args, context) {
      return context.loaders.userById.load(args.id);
    },
    partnership(_, args, context) {
      return context.loaders.partnershipById.load(args.id);
    },
    game(_, args, context) {
      return context.loaders.gameById.load(args.id);
    },
  },
  User: {
    partnerships(obj) {
      return db.partnershipsByUserId(obj.id);
    },
    dailyChallengeInfo(obj) {
      return {
        userId: obj.id
      }
    },
  },
  Partnership: {
    users(obj, _, context) {
      return context.loaders.userById.loadMany([obj.user1Id, obj.user2Id]);
    },
    partner(obj, args, context) {
      var partnerId = (obj.user1Id === args.userId) ? obj.user2Id : obj.user1Id;
      return context.loaders.userById.load(partnerId);
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
      return db.incomingDailyChallengeRequests(obj.userId);
    },
    outgoingRequests(obj) {
      return db.outgoingDailyChallengeRequests(obj.userId);
    },
    games(obj, _, context) {
      return db.dailyChallengeEntry(obj.userId).then((entry) => {
        if (entry) {
          return context.loaders.gameById.loadMany(
            [entry.game1Id, entry.game2Id]);
        } else {
          return [];
        }
      })
    },
  },
  DailyChallengeRequest: {
    partner(obj, args, context) {
      var partnerId = (obj.fromUserId === args.userId) ?
        obj.toUserId : obj.fromUserId;
      return context.loaders.userById.load(partnerId);
    },
  },
  Mutation: {
    updateUser(_, args, context) {
      return context.loaders.userById.load(args.id).then(
        (user) => db.updateUser(user, args));
    },
    addPushToken(_, args, context) {
      return context.loaders.userById.load(args.userId).then((user) => {
        if (user.pushTokens && user.pushTokens.includes(args.pushToken)) {
          return user;
        } else {
          return db.updateUser(user, {
            pushTokens: user.pushTokens ?
              user.pushTokens.concat([args.pushToken]) : [args.pushToken]
          });
        }
      });
    },
    newGame(_, args) {
      return db.partnershipByUserIds(args.cluerId, args.guesserId).then(
        (partnership) => {
          var word = words[Math.floor(Math.random() * words.length)];
          if (partnership) {
            return db.createGame(word, args.cluerId, partnership);
          } else {
            return db.createPartnership(user1Id, user2Id).then(
              (partnership) => db.createGame(word, args.cluerId, partnership));
          }
        });
    },
    giveClues(_, args, context) {
      return context.loaders.gameById.load(args.gameId).then((game) => (
        game.update({clues: args.clues}).then((game) => {
          notifications.notifyCluesGiven(game);
          return game;
        })
      ));
    },
    makeGuesses(_, args, context) {
      return context.loaders.gameById.load(args.gameId).then((game) => (
        game.update({guesses: args.guesses}).then((game) => {
          notifications.notifyGuessesMade(game);
          return game;
        })
      ));
    },
    sendDailyChallengeRequest(_, args) {
      return db.createDailyChallengeRequest(args.fromUserId, args.toUserId);
    },
    acceptDailyChallengeRequest(_, args, context) {
      return context.loaders.dailyChallengeRequestById.load(
        args.requestId).then((request) => {
          return db.partnershipByUserIds(
            request.fromUserId, request.toUserId).then((partnership) => {
              var createGames = (partnership) => {
                var words = dailyChallenge.getWordsForDate(request.date);
                return Sequelize.Promise.all([
                  db.createGame(words[0], user1Id, partnership),
                  db.createGame(words[1], user2Id, partnership),
                ]).spread((game1, game2) => {
                  db.createDailyChallengeEntry(
                    request.date, user1Id, user2Id, game1, game2).then(
                      (entry) => [game1, game2]);
                });
              };

              if (partnership) {
                return createGames(partnership);
              } else {
                return db.createPartnership(user1Id, user2Id).then(
                  (partnership) => createGames(partnership));
              }
            });
        });
    },
  }
};

module.exports = resolvers
