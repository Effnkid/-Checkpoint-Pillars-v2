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
// class methods
User.findUnassignedStudents = async function () {
  return await User.findAll({ where: { mentorId: null, userType: `STUDENT` } });
};

User.findTeachersAndMentees = async function () {
  return await User.findAll({
    include: `mentees`,
    where: { mentorId: null, userType: `TEACHER` },
  });
};
// instance method (Extra Credit)
User.prototype.getPeers = async function () {
  return await User.findAll({
    where: {
      mentorId: this.mentorId,
      userType: `STUDENT`,
      [Sequelize.Op.not]: [{ id: this.id }],
    },
  });
};

// hooks

User.beforeUpdate(async (user, option) => {
  // check options params for what is being updated
  if (option.fields[0] === `mentorId`) {
    const find = await User.findByPk(user.mentorId);
    if (find.userType === `STUDENT` && user.userType === `STUDENT`) {
      throw new Error();
    }
  } else if (option.fields[0] === `userType`) {
    const count = await user.countMentees(); // if user is a teacher and has mentee
    if (user.mentorId) {
      throw new Error();
    } else if (count > 0) {
      throw new Error();
    }
  }
});

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
