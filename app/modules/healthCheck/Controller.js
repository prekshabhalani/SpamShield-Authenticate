const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const Controller = require('../Base/Controller');

module.exports = class TestController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
    @Purpose Test API server 
    @Parameter {}
    @Return JSON String
  ********************************************************/
  async welcome() {
    try {
      /**** Manage Resolve Response */
      return handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: 'Welcome to the Spam Shield Server :)'
      });

    } catch (error) {
      /**** Manage Error logs and Response */
      return handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        'SERVER_ERROR'
      );
    }
  }
};
