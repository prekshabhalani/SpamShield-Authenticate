/****************************
 POSTGRESQL SEQUELIZE CONNECTION
 ****************************/
const config = require('./config.js').DB;
const { Sequelize } = require('sequelize');
const { glob } = require('glob');
const path = require('path');

const postgres = (config.dbURL) ?? `${config.dialect}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
const sequelizeConnection = new Sequelize(postgres, {
  logging: false,
  sync: true,
});


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
  let db = {};

  const schemaFilePathPattern = `${__dirname}/../app/modules/**/*Schema.js`;
  const schemaFiles = await glob(schemaFilePathPattern);

  for (const schema of schemaFiles) {
    try {
      const models = require(path.resolve(schema));
      db = { ...db, ...models };
    } catch (err) {
      console.error('Error processing schema:', schema, err);
    }
  }

  Object.keys(db).forEach((modelName) => {
    if (modelName && db[modelName] && db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  await sequelizeConnection.sync();
  return sequelizeConnection;

};


module.exports = { sequelizeConnection, databaseConnection };
