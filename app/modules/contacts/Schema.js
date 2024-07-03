const { Sequelize, DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

const Contact = sequelizeConnection.define('Contact', {
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
    allowNull: false
  }
}, {
  tableName: 'contacts',
  timestamps: true
});

Contact.associate = (models) => {
  Contact.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = { Contact };
