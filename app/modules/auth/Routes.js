module.exports = (app, express) => {
    const router = express.Router();
    const config = require('../../../configs/config').SERVER
    const Controller = require('./Controller');
    const { registerValidation, loginValidation, validate } = require('./validator');

    /**** User Register API */
    router.post('/register', validate(registerValidation), (req, res, next) => {
        const obj = new Controller(req, res, next)
        return obj.register();
    });

    /**** User Login API */
    router.post('/login', validate(loginValidation), (req, res, next) => {
        const obj = new Controller(req, res, next)
        return obj.login();
    });

    app.use(config.baseApiUrl, router);
};
