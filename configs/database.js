/****************************
 POSTGRESQL SEQUELIZE CONNECTION
 ****************************/
const config = require('./config.js').DB;
const { Sequelize } = require('sequelize');
const glob = require('glob');


const postgres = `${config.dialect}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
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
  const modules = '/../app/modules';
  const schemaFiles = glob.sync(__dirname + modules + '/**/*Schema.js');
  schemaFiles.forEach((schema) => {
    const models = require(schema);
    db = { ...db, ...models };
  });

  Object.keys(db).forEach((modelName) => {
    if (modelName && db[modelName] && db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  await sequelizeConnection.sync();
  return sequelizeConnection;

};


module.exports = { sequelizeConnection, databaseConnection };
