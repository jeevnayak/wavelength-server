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
  fbToken: Sequelize.STRING,
  pushTokens: Sequelize.ARRAY(Sequelize.STRING)
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
  clues: Sequelize.ARRAY(Sequelize.STRING),
  guesses: Sequelize.ARRAY(Sequelize.STRING),
  replayed: Sequelize.BOOLEAN,
  updated: Sequelize.DATE,
});

Partnership.hasMany(Game);

const DailyChallengeRequest = db.define("daily_challenge_request", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: Sequelize.STRING,
  fromUserId: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id"
    }
  },
  toUserId: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id"
    }
  },
});

const DailyChallengeEntry = db.define("daily_challenge_entry", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: Sequelize.STRING,
  user1Id: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id"
    }
  },
  user2Id: {
    type: Sequelize.STRING,
    references: {
      model: User,
      key: "id"
    }
  },
  game1Id: {
    type: Sequelize.INTEGER,
    references: {
      model: Game,
      key: "id"
    }
  },
  game2Id: {
    type: Sequelize.INTEGER,
    references: {
      model: Game,
      key: "id"
    }
  },
});

module.exports.db = db
module.exports.User = db.models.user
module.exports.Partnership = db.models.partnership
module.exports.Game = db.models.game
module.exports.DailyChallengeRequest = db.models.daily_challenge_request
module.exports.DailyChallengeEntry = db.models.daily_challenge_entry
