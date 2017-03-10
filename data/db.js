var dailyChallenge = require("../util/dailyChallenge");
var models = require("./models");

module.exports.partnershipByUserIds = async function(userId1, userId2) {
  var user1Id = (userId1 < userId2) ? userId1 : userId2;
  var user2Id = (userId1 < userId2) ? userId2 : userId1;
  return await models.Partnership.findOne({
    where: {
      user1Id: user1Id,
      user2Id: user2Id
    }
  })
};

module.exports.partnershipsByUserId = async function(userId) {
  return await models.Partnership.findAll({
    where: {
      $or: {
        user1Id: userId,
        user2Id: userId
      }
    }
  });
};

module.exports.incomingDailyChallengeRequests = async function(userId) {
  return await models.DailyChallengeRequest.findAll({
    where: {
      date: dailyChallenge.getCurrentDateStr(),
      toUserId: userId
    }
  });
};

module.exports.outgoingDailyChallengeRequests = async function(userId) {
  return await models.DailyChallengeRequest.findAll({
    where: {
      date: dailyChallenge.getCurrentDateStr(),
      fromUserId: userId
    }
  });
};

module.exports.dailyChallengeEntry = async function(userId) {
  return await models.DailyChallengeEntry.findOne({
    where: {
      date: dailyChallenge.getCurrentDateStr(),
      $or: {
        user1Id: userId,
        user2Id: userId
      }
    }
  });
};

module.exports.updateUser = async function(user, args) {
  if (!user) {
    user = models.User.build({id: args.id});
  }
  return await user.update(args);
};

module.exports.createPartnership = async function(userId1, userId2) {
  var user1Id = (userId1 < userId2) ? userId1 : userId2;
  var user2Id = (userId1 < userId2) ? userId2 : userId1;
  return await models.Partnership.create({
    user1Id: user1Id,
    user2Id: user2Id
  });
};

module.exports.createGame = async function(word, cluerId, partnership) {
  return await models.Game.create({
    word: word,
    cluerId: cluerId,
    partnershipId: partnership.id
  });
};

module.exports.createDailyChallengeRequest = async function(
    fromUserId, toUserId) {
  return await models.DailyChallengeRequest.create({
    date: dailyChallenge.getCurrentDateStr(),
    fromUserId: fromUserId,
    toUserId: toUserId
  });
};

module.exports.createDailyChallengeEntry = async function(
    date, user1Id, user2Id, game1, game2) {
  return await models.DailyChallengeEntry.create({
    date: date,
    user1Id: user1Id,
    user2Id: user2Id,
    game1Id: game1.id,
    game2Id: game2.id
  });
};
