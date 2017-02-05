var Exponent = require("exponent-server-sdk");

var models = require("./data/models");

var exponent = new Exponent();

var notifyTurnEnded = function(game, cluesGiven) {
  models.Partnership.findById(game.partnershipId).then(function(partnership) {
    models.User.findAll({
      where: {
        id: {
          $in: [partnership.user1Id, partnership.user2Id]
        }
      }
    }).then(function(users) {
      var sender;
      var recipient;
      users.forEach(function(user) {
        if (user.id === game.cluerId && cluesGiven ||
            user.id !== game.cluerId && !cluesGiven) {
          sender = user;
        } else {
          recipient = user;
        }
      });
      if (recipient.pushTokens) {
        recipient.pushTokens.forEach(function(pushToken) {
          exponent.sendPushNotificationsAsync([{
            to: pushToken,
            sound: "default",
            body: sender.firstName + " just went, it's your turn!"
          }]);
        });
      }
    })
  });
}

module.exports.notifyCluesGiven = function(game) {
  notifyTurnEnded(game, true);
}

module.exports.notifyGuessesMade = function(game) {
  notifyTurnEnded(game, false);
}
