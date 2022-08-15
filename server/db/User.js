const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  // Add your Sequelize fields here

  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  userType: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'STUDENT',
    validate: {
      isIn: [['STUDENT', 'TEACHER']],
    },
  },
  isStudent: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === `STUDENT`;
    },
  },
  isTeacher: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === `TEACHER`;
    },
  },
});

User.findUnassignedStudents = async function () {
  return await User.findAll({ where: { mentorId: null, userType: `STUDENT` } });
};

User.findTeachersAndMentees = async function () {
  return await User.findAll({
    include: `mentees`,
    where: { mentorId: null, userType: `TEACHER` },
  });
};

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
