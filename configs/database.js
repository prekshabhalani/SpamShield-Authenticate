/****************************
 POSTGRESQL SEQUELIZE CONNECTION
 ****************************/
const config = require('./config.js').DB;
const { Sequelize } = require('sequelize');
const { glob } = require('glob');
const path = require('path');

const postgres = `${config.dialect}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`

const sequelizeOptions = {
  logging: false,
  sync: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

// Enable sslConnection
if (config.enableSSL && config.enableSSL == 'false') {
  delete sequelizeOptions.dialectOptions.ssl;
}

const sequelizeConnection = new Sequelize(postgres, sequelizeOptions);
const databaseConnection = async () => {
  sequelizeConnection
    .authenticate()
    .then(() => {
      console.log('Connection to Database has been established successfully :)');
    })
    .catch((error) => {
      console.error('Unable to connect to the database :( \n', error);
    });

  // getting all model schema and set their relation
  let dbModels = {};

  const schemaFilePathPattern = `${__dirname}/../app/modules/**/*Schema.js`;
  const schemaFiles = await glob(schemaFilePathPattern);

  for (const schema of schemaFiles) {
    try {
      dbModels = { ...dbModels, ...require(path.resolve(schema)) };
    } catch (err) {
      console.error('Error processing schema:', schema, err);
    }
  }

  Object.keys(dbModels).forEach((modelName) => {
    if (modelName && dbModels[modelName] && dbModels[modelName].associate) {
      dbModels[modelName].associate(dbModels);
    }
  });

  await sequelizeConnection.sync();
  return sequelizeConnection;
};

module.exports = { sequelizeConnection, databaseConnection };
