const commonServices = require('../../services/commonServices');
const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const { PhoneNumber, ContactDirectory } = require('../contacts/Schema');
const { User } = require("../users/Schema");
const { sequelizeConnection } = require('../../../configs/database');

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

            const existingPhoneNumber = await PhoneNumber.findOne({
                where: { number: phoneNumber }
            });

            if (existingPhoneNumber) {
                const associatedContact = await ContactDirectory.findOne({
                    where: { phoneId: existingPhoneNumber.id, isUserDetails: true }
                });

                if (associatedContact) {
                    return handleReject(
                        this.res,
                        HTTP_CODE.FAILED,
                        HTTP_CODE.CONFLICT_CODE,
                        "Phone number is already registered."
                    );
                }
            }

            //Encrypt password
            const hashedPassword = await commonServices.encryptPassword(password);

            //Process the new registration
            const result = await sequelizeConnection.transaction(async registrationTransaction => {
                const user = await User.create({ password: hashedPassword }, { transaction: registrationTransaction });
                const phoneDetail = await PhoneNumber.create({ number: phoneNumber }, { transaction: registrationTransaction });
                const userInfo = await ContactDirectory.create({ name, email, isUserDetails: true, userId: user.id, phoneId: phoneDetail.id }, { transaction: registrationTransaction });
                return { user, phoneDetail, userInfo };
            });

            /**** Generate  UserId phoneId and userInfoId Based Token */
            const token = commonServices.generateToken(result.userInfo.id);

            // Create user needed details 
            const userDetails = {
                "id": result.userInfo.id,
                name,
                phoneNumber,
                email
            }

            /**** Send Successful Response */
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

            const existingPhoneNumber = await PhoneNumber.findOne({
                where: { number: phoneNumber }
            });

            if (existingPhoneNumber) {
                const userDetails = await ContactDirectory.findOne({
                    where: { phoneId: existingPhoneNumber.id, isUserDetails: true },
                    include: [
                        {
                            model: PhoneNumber,
                            attributes: ['number']
                        },
                        {
                            model: User,
                            attributes: ['password', 'id']
                        }
                    ],
                    attributes: ['id', 'email', 'name'],
                    raw: true
                });

                /**** No registered phone number entry with current user  */
                if (!userDetails) {
                    return handleReject(
                        this.res,
                        HTTP_CODE.FAILED,
                        HTTP_CODE.NOT_FOUND_CODE,
                        "User not found."
                    );
                }

                /**** Login Process */
                const isPasswordValid = await commonServices.verifyPassword(password, userDetails['User.password']);

                if (!isPasswordValid) {
                    return this.res.status(401).json({ error: 'Invalid credentials.' });
                }

                const token = commonServices.generateToken(userDetails.id);

                const userDetailsResponse = {
                    id: userDetails.id,
                    name: userDetails.name,
                    phoneNumber,
                    email: userDetails.email
                }
                
                /**** Send Successful Response */
                return handleResolve({
                    res: this.res,
                    status: HTTP_CODE.RESOURCE_CREATED_CODE,
                    statusCode: HTTP_CODE.SUCCESS_CODE,
                    data: { userDetailsResponse, token },
                    message: 'Login Successfully.'
                });
            }

            //No user entry with this phone number
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.NOT_FOUND_CODE,
                "User not found."
            );

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