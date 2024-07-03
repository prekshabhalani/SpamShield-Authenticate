

const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');

module.exports = class TestController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
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
                message: 'Welcome to the Spam Shield-Authentication Server :)'
            });
            
        } catch (error) {
            
            /**** Manage Error logs and Response */   
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "SERVER_ERROR"
            );
        }
    }

}