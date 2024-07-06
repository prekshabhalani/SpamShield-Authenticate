const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { glob } = require('glob');
const config = require('./configs/config').SERVER;
const { databaseConnection } = require('./configs/database');
const fs = require('fs-extra');
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

global.appRoot = path.resolve(__dirname);
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
  })
);

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  return res.send({
    status: 0,
    statusCode: 500,
    message: err.message,
    error: err
  });
});
app.use(express.json());

// Getting all routes
const routerFilePathPattern = `${__dirname}/app/modules/**/Routes.js`;
(async () => {
  try {
    const files = await glob(routerFilePathPattern);
    for (const route of files) {
      try {
        const stats = await fs.stat(route);
        const fileSizeInBytes = stats.size;
        if (fileSizeInBytes) {
          require(path.resolve(route))(app, express);
        }
      } catch (err) {
        console.error('Error processing route:', route, err);
      }
    }
  } catch (err) {
    console.error('Error loading routes:', err);
  }
})();

const PORT = config.port || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
