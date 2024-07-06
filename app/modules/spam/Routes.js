module.exports = (app, express) => {
    const router = express.Router();
    const config = require('../../../configs/config').SERVER
    const Controller = require('./Controller');
    const { spamNumberValidation, validate } = require('./Validator');
    const Middlewares = require("../../services/middlewares")

    /**** Spam Number API */
    router.post('/spam', Middlewares.isAuthenticateUser(), validate(spamNumberValidation), (req, res, next) => {
        const obj = new Controller(req, res, next).boot(req, res,next)
        return obj.spamPhoneNumber();
    });

    app.use(config.baseApiUrl, router);
};
