var Exponent = require("exponent-server-sdk");

var models = require("./data/models");

var exponent = new Exponent();

async function notifyTurnEnded(game, cluesGiven) {
  var partnership = await models.Partnership.findById(game.partnershipId);
  var users = await models.User.findAll({
    where: {
      id: {
        $in: [partnership.user1Id, partnership.user2Id]
      }
    }
  });
  var sender;
  var recipient;
  users.forEach((user) => {
    if (user.id === game.cluerId && cluesGiven ||
        user.id !== game.cluerId && !cluesGiven) {
      sender = user;
    } else {
      recipient = user;
    }
  });
  if (recipient.pushTokens) {
    var message = cluesGiven ?
      sender.firstName + " just went, it's your turn!" :
      sender.firstName + " just finished, see what happened!"
    var notifications = recipient.pushTokens.map((pushToken) => ({
      to: pushToken,
      sound: "default",
      body: message,
      data: {
        gameId: game.id,
        cluesGiven: cluesGiven
      }
    }));
    exponent.sendPushNotificationsAsync(notifications);
  }
}

module.exports.notifyCluesGiven = (game) => notifyTurnEnded(game, true);
module.exports.notifyGuessesMade = (game) => notifyTurnEnded(game, false);
