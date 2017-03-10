var dailyChallenge = require("../util/dailyChallenge");
var db = require("./db");
var notifications = require("../notifications");
var words = require("./words");

var resolvers = {
  Query: {
    async user(_, args, context) {
      return await context.loaders.userById.load(args.id);
    },
    async partnership(_, args, context) {
      return await context.loaders.partnershipById.load(args.id);
    },
    async game(_, args, context) {
      return await context.loaders.gameById.load(args.id);
    },
    async possibleWords(_, args, context) {
      var partnership = await db.partnershipByUserIds(
        args.cluerId, args.guesserId);
      var blacklist = [];
      if (partnership) {
        var games = await partnership.getGames();
        blacklist = games.map((game) => game.word);
      }
      return words.possibleWords(args.numWords, blacklist);
    }
  },
  User: {
    async partnerships(obj) {
      return await db.partnershipsByUserId(obj.id);
    },
    dailyChallengeInfo(obj) {
      return {
        userId: obj.id
      }
    },
  },
  Partnership: {
    async users(obj, _, context) {
      return await context.loaders.userById.loadMany(
        [obj.user1Id, obj.user2Id]);
    },
    async partner(obj, args, context) {
      var partnerId = (obj.user1Id === args.userId) ? obj.user2Id : obj.user1Id;
      return await context.loaders.userById.load(partnerId);
    },
    async games(obj) {
      return await obj.getGames();
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
    async incomingRequests(obj) {
      return await db.incomingDailyChallengeRequests(obj.userId);
    },
    async outgoingRequests(obj) {
      return await db.outgoingDailyChallengeRequests(obj.userId);
    },
    async games(obj, _, context) {
      var entry = await db.dailyChallengeEntry(obj.userId);
      if (entry) {
        return await context.loaders.gameById.loadMany(
          [entry.game1Id, entry.game2Id]);
      } else {
        return [];
      }
    },
  },
  DailyChallengeRequest: {
    async partner(obj, args, context) {
      var partnerId = (obj.fromUserId === args.userId) ?
        obj.toUserId : obj.fromUserId;
      return await context.loaders.userById.load(partnerId);
    },
  },
  Mutation: {
    async updateUser(_, args, context) {
      var user = await context.loaders.userById.load(args.id);
      return await db.updateUser(user, args);
    },
    async addPushToken(_, args, context) {
      var user = await context.loaders.userById.load(args.userId);
      if (user.pushTokens && user.pushTokens.includes(args.pushToken)) {
        return user;
      } else {
        return await db.updateUser(user, {
          pushTokens: user.pushTokens ?
            user.pushTokens.concat([args.pushToken]) : [args.pushToken]
        });
      }
    },
    async newGame(_, args) {
      var partnership = await db.partnershipByUserIds(
        args.cluerId, args.guesserId);
      if (!partnership) {
        partnership = await db.createPartnership(args.cluerId, args.guesserId);
      }
      return await db.createGame(args.word, args.cluerId, partnership);
    },
    async giveClues(_, args, context) {
      var game = await context.loaders.gameById.load(args.gameId);
      game = await game.update({clues: args.clues});
      notifications.notifyCluesGiven(game);
      return game;
    },
    async makeGuesses(_, args, context) {
      var game = await context.loaders.gameById.load(args.gameId);
      game = await game.update({guesses: args.guesses});
      notifications.notifyGuessesMade(game);
      return game;
    },
    async sendDailyChallengeRequest(_, args) {
      return await db.createDailyChallengeRequest(
        args.fromUserId, args.toUserId);
    },
    async acceptDailyChallengeRequest(_, args, context) {
      var request = await context.loaders.dailyChallengeRequestById.load(
        args.requestId);
      var partnership = await db.partnershipByUserIds(
        request.fromUserId, request.toUserId);
      if (!partnership) {
        partnership = await db.createPartnership(
          request.fromUserId, request.toUserId);
      }
      var words = dailyChallenge.getWordsForDate(request.date);
      var games = await Promise.all([
        db.createGame(words[0], request.fromUserId, partnership),
        db.createGame(words[1], request.toUserId, partnership),
      ]);
      var entry = await db.createDailyChallengeEntry(
        request.date, request.fromUserId, request.toUserId, games[0], games[1]);
      return games;
    },
  }
};

module.exports = resolvers
