const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const glob = require('glob');
const config = require('./configs/config');

const app = express();
app.use(bodyParser.json());

// Dynamically load routes
const routesPath = path.join(__dirname, 'app/modules');
glob.sync(`${routesPath}/**/Routes.js`).forEach(routeFile => {
  const route = require(routeFile);
  const routePath = `/${path.basename(path.dirname(routeFile)).toLowerCase()}`;
  app.use(routePath, route);
  console.log(`Loaded ${routePath} routes`);
});

const PORT = config.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
