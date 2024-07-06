const config = require('../../../configs/config').SERVER;

module.exports = (app, express) => {
  const router = express.Router();
  const Controller = require('./Controller');

  /**** Get random data entry  */
  router.get('/seed_data', (req, res, next) => {
    const obj = new Controller(req, res, next).boot(req, res, next)
    return obj.generateSeedData();
  });

  app.use(config.baseApiUrl, router);
};
