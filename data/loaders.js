var DataLoader = require('dataloader');

var models = require("./models");

var getObjectsById = (model, ids) => {
  return model.findAll({
    where: {
      id: {
        $in: ids
      }
    }
  }).then((objects) => {
    var objectsById = {};
    for (var i = 0; i < objects.length; i++) {
      var object = objects[i];
      objectsById[object.id] = object;
    }
    return ids.map((id) => objectsById[id]);
  });
};

module.exports.createLoaders = () => ({
  userById: new DataLoader((ids) => getObjectsById(models.User, ids)),
  partnershipById: new DataLoader(
    (ids) => getObjectsById(models.Partnership, ids)),
  gameById: new DataLoader((ids) => getObjectsById(models.Game, ids)),
  dailyChallengeRequestById: new DataLoader(
    (ids) => getObjectsById(models.DailyChallengeRequest, ids))
});
