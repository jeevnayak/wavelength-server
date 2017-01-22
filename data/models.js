var Sequelize = require("sequelize");

const db = new Sequelize(process.env.DATABASE_URL);

const UserModel = db.define("user", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  fbToken: Sequelize.STRING
});

module.exports.db = db
module.exports.User = db.models.user
