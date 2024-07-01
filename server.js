const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const glob = require('glob');
const config = require('./configs/config').SERVER;
const { databaseConnection } = require('./configs/database');

const app = express();
app.use(bodyParser.json());


// Database connection
(async () => {
  try {
    await databaseConnection();
  } catch (error) {
    console.error('Error connecting to the database or seeding data:', error);
  }
})();

// Dynamically load routes
const routesPath = path.join(__dirname, 'app/modules');
glob.sync(`${routesPath}/**/Routes.js`).forEach(routeFile => {
  const route = require(routeFile);
  const routePath = `/${path.basename(path.dirname(routeFile)).toLowerCase()}`;
  app.use(routePath, route);
  console.log(`Loaded ${routePath} routes`);
});

const PORT = config.port || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
