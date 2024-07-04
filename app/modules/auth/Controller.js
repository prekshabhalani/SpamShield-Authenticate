

const commonServices = require('../../services/commonServices');
const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const { User } = require("../users/Schema");
const Projection = require("./Projection.json");
module.exports = class AuthController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    /********************************************************
       @Purpose Register User 
       @Parameter {
           name: Preksha bhalani,
           phoneNumber: 9265000026,
           password: string,
           email: user@domain.com
       }
       @Return JSON String
   ********************************************************/

    async register() {
        try {

            /**** Manage Data And Store Into DB */
            const { name, phoneNumber, password, email } = this.req.body;

            const hashedPassword = await commonServices.encryptPassword(password);

            const user = await User.create({
                name,
                phoneNumber,
                password: hashedPassword,
                email
            });

            /**** Generate  User Id Based Token */
            const token = commonServices.generateToken(user.id);

            // Fetch the user needed details 
            const userDetails = await User.findOne({
                where: { id: user.id },
                attributes: { exclude: Projection.UserExcludedFields }
            });

            /**** Manage Resolve Response */
            return handleResolve({
                res: this.res,
                status: HTTP_CODE.RESOURCE_CREATED_CODE,
                statusCode: HTTP_CODE.SUCCESS_CODE,
                data: { userDetails, token },
                message: 'Login Successfully.'
            });

        } catch (error) {
            if (commonServices.databaseUniqConstrainViolation(error)) {
                /**** Manage Database unique value field Error and Response */
                return commonServices.handleDatabaseUniqConstrainViolation(this.res, error.fields)
            } else {
                console.log(error, "register()");
                /**** Manage Error logs and Response */
                return handleReject(
                    this.res,
                    HTTP_CODE.FAILED,
                    HTTP_CODE.SERVER_ERROR_CODE,
                    "An error occurred while registering."
                );
            }
        }
    }

    /********************************************************
         @Purpose Login User 
         @Parameter {
             phoneNumber: 9265000026,
             password: string
         }
         @Return JSON String
     ********************************************************/

    async login() {
        try {
            const { phoneNumber, password } = this.req.body;

            const user = await User.findOne({ where: { phoneNumber } });

            if (!user) {
                return this.res.status(404).json({ error: 'User not found.' });
            }

            const isPasswordValid = await commonServices.verifyPassword(password, user.password);

            if (!isPasswordValid) {
                return this.res.status(401).json({ error: 'Invalid credentials.' });
            }

            const token = commonServices.generateToken(user.id);

            const userDetails = await User.findOne({
                where: { phoneNumber },
                attributes: { exclude: Projection.UserExcludedFields }
            });

            /**** Manage Resolve Response */
            return handleResolve({
                res: this.res,
                status: HTTP_CODE.RESOURCE_CREATED_CODE,
                statusCode: HTTP_CODE.SUCCESS_CODE,
                data: { userDetails, token },
                message: 'Login Successfully.'
            });

        } catch (error) {
            console.log(error, "login()");
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "An error occurred while registering."
            );
        }
    };

}