var dailyChallenge = require("../util/dailyChallenge");
var models = require("./models");

module.exports.partnershipByUserIds = (userId1, userId2) => {
  var user1Id = (userId1 < userId2) ? userId1 : userId2;
  var user2Id = (userId1 < userId2) ? userId2 : userId1;
  return models.Partnership.findOne({
    where: {
      user1Id: user1Id,
      user2Id: user2Id
    }
  })
};

module.exports.partnershipsByUserId = (userId) => (
  models.Partnership.findAll({
    where: {
      $or: {
        user1Id: userId,
        user2Id: userId
      }
    }
  })
);

module.exports.incomingDailyChallengeRequests = (userId) => (
  models.DailyChallengeRequest.findAll({
    where: {
      date: dailyChallenge.getCurrentDateStr(),
      toUserId: userId
    }
  })
);

module.exports.outgoingDailyChallengeRequests = (userId) => (
  models.DailyChallengeRequest.findAll({
    where: {
      date: dailyChallenge.getCurrentDateStr(),
      fromUserId: userId
    }
  })
);

module.exports.dailyChallengeEntry = (userId) => (
  models.DailyChallengeEntry.findOne({
    where: {
      date: dailyChallenge.getCurrentDateStr(),
      $or: {
        user1Id: userId,
        user2Id: userId
      }
    }
  })
);

module.exports.updateUser = (user, args) => {
  if (!user) {
    user = models.User.build({id: args.id});
  }
  return user.update(args);
};

module.exports.createPartnership = (user1Id, user2Id) => (
  models.Partnership.create({
    user1Id: user1Id,
    user2Id: user2Id
  })
);

module.exports.createGame = (word, cluerId, partnership) => (
  models.Game.create({
    word: word,
    cluerId: cluerId,
    partnershipId: partnership.id
  })
);

module.exports.createDailyChallengeRequest = (fromUserId, toUserId) => (
  models.DailyChallengeRequest.create({
    date: dailyChallenge.getCurrentDateStr(),
    fromUserId: fromUserId,
    toUserId: toUserId
  })
);

module.exports.createDailyChallengeEntry = (
    date, user1Id, user2Id, game1, game2) => (
  models.DailyChallengeEntry.create({
    date: date,
    user1Id: user1Id,
    user2Id: user2Id,
    game1Id: game1.id,
    game2Id: game2.id
  })
);
