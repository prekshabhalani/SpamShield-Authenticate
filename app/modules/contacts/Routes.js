const Middlewares = require('../../services/middlewares');
const { validate, personDetailsValidation } = require('./Validator');

module.exports = (app, express) => {
  const router = express.Router();
  const Controller = require('./Controller');
  const config = require('../../../configs/config').SERVER

  /**** Contact's info based on search result */
  router.get('/personDetails', Middlewares.isAuthenticateUser(), validate(personDetailsValidation), (req, res, next) => {
    const obj = new Controller(req, res, next).boot(req, res, next)
    return obj.getPersonDetails();
  });

  app.use(config.baseApiUrl, router);
};
