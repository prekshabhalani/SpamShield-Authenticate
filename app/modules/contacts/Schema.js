const { Sequelize, DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');
const { User } = require('../users/Schema');

// Define PhoneNumber model
const PhoneNumber = sequelizeConnection.define('PhoneNumber', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'phone_numbers',
  timestamps: true
});

// Associations
PhoneNumber.associate = (models) => {

  PhoneNumber.hasMany(models.SpamList, {
    foreignKey: {
      allowNull: true
    }
  });

  PhoneNumber.hasMany(models.ContactDirectory, {
    foreignKey: {
      name: 'phoneId',
      allowNull: true
    }
  });
}

// Define ContactDirectory model
const ContactDirectory = sequelizeConnection.define('ContactDirectory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isRegistered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  phoneId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: PhoneNumber,
      key: 'id'
    }
  }
}, {
  tableName: 'contact_directory',
  timestamps: true
});

// Associations
ContactDirectory.associate = (models) => {
  ContactDirectory.belongsTo(models.User, {
    foreignKey: {
      name: 'userId',
      allowNull: true
    }
  });
  ContactDirectory.belongsTo(models.PhoneNumber, {
    foreignKey: {
      name: 'phoneId',
      allowNull: true
    }
  });
}

module.exports = { ContactDirectory, PhoneNumber };
