const {  DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

// Define SpamList model
const SpamList = sequelizeConnection.define(
  'SpamList',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  },
  { tableName: 'spam_list', timestamps: true }
);

// Association
SpamList.associate = (models) => {
  SpamList.belongsTo(models.PhoneNumber);

  SpamList.belongsTo(models.User, {
    foreignKey: {
      name: 'markedById',
      allowNull: true
    }
  });
};

module.exports = { SpamList };
