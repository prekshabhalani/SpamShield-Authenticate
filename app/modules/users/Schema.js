const { Sequelize, DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

const User = sequelizeConnection.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

User.associate = (models) => {
  User.hasMany(models.Contact, { as: 'contacts', foreignKey: 'userId' });
  User.hasMany(models.Spam, { as: 'spamMarks', foreignKey: 'markedBy' });
};

module.exports = { User };
