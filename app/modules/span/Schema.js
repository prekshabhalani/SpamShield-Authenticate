const { Sequelize, DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

const Spam = sequelizeConnection.define('Spam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  markedBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'spam',
  timestamps: true
});

Spam.associate = (models) => {
  Spam.belongsTo(models.User, { as: 'marker', foreignKey: 'markedBy' });
};

module.exports = { Spam };
