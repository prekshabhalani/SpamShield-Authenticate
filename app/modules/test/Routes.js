module.exports = (app, express) => {
    const router = express.Router();
    const Controller = require('./Controller');
    const config = require('../../../configs/config').SERVER

    /**** Test API Status */
    router.get('/', (req, res, next) => {
        const obj = new Controller(req, res, next)
        return obj.welcome();
    });

    app.use(config.baseApiUrl, router);
};
