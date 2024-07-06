const { validate, searchNameValidation, searchNumberValidation } = require('./Validator');

module.exports = (app, express) => {
  const router = express.Router();
  const config = require('../../../configs/config').SERVER
  const Controller = require('../search/Controller');
  const Middlewares = require('../../services/middlewares')

  /**** Spam Number API */
  router.get('/search_by_name', Middlewares.isAuthenticateUser(), validate(searchNameValidation), (req, res, next) => {
    const obj = new Controller(req, res, next).boot(req, res, next)
    return obj.searchByName();
  });

  /**** Spam Number API */
  router.get('/search_by_phone_number', Middlewares.isAuthenticateUser(), validate(searchNumberValidation), (req, res, next) => {
    const obj = new Controller(req, res, next).boot(req, res, next)
    return obj.searchByPhoneNumber();
  });

  app.use(config.baseApiUrl, router);
};
