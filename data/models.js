var Sequelize = require("sequelize");

const db = new Sequelize(process.env.DATABASE_URL);

const User = db.define("user", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  fbToken: Sequelize.STRING
});

const Partnership = db.define("partnership", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1Id: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id",
      unique: "partners"
    }
  },
  user2Id: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id",
      unique: "partners"
    }
  }
});

const Game = db.define("game", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cluerId: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id"
    }
  },
  word: Sequelize.STRING,
  clues: Sequelize.STRING,
  guesses: Sequelize.STRING,
  replayed: Sequelize.BOOLEAN
});

Partnership.hasMany(Game);

module.exports.db = db
module.exports.User = db.models.user
module.exports.Partnership = db.models.partnership
module.exports.Game = db.models.game
