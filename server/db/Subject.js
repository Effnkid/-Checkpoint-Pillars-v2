const Sequelize = require('sequelize');
const db = require('./db');

const Subject = db.define('subject', {
  // Add your Sequelize fields here

  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
});

module.exports = Subject;
