const { Sequelize, DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

// Define User model
const User = sequelizeConnection.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

//Association
User.associate = (models) => {
  User.hasMany(models.ContactDirectory, {
    foreignKey: {
      name: 'userId',
      allowNull: true
    }
  });
  User.hasMany(models.SpamList, {
    foreignKey: 'markedById',
    allowNull: false
  });
}

module.exports = { User };
