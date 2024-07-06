const commonServices = require('../../services/commonServices');
const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const Controller = require('../Base/Controller');
const { PhoneNumber, ContactDirectory } = require('../contacts/Schema');
const { User } = require('../users/Schema');
const { sequelizeConnection } = require('../../../configs/database');

module.exports = class UserController extends Controller {
  constructor() {
    super();
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

      // Check if the phone number exists
      const existingPhoneNumber = await PhoneNumber.findOne({
        where: { number: phoneNumber }
      });

      // If the phone number exists,Check for register entry
      if (existingPhoneNumber) {
        // Check if register entry exists
        const associatedContact = await ContactDirectory.findOne({
          where: { phoneId: existingPhoneNumber.id, isUserDetails: true }
        });

        // if already have register entry send a response
        if (associatedContact) {
          return handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.CONFLICT_CODE,
            'Phone number is already registered.'
          );
        }
      }

      // Process the new registration
      const result = await sequelizeConnection.transaction(async registrationTransaction => {
        // Encrypt password
        const hashedPassword = await commonServices.encryptPassword(password);

        // Create a new user entry
        const user = await User.create({ password: hashedPassword }, { transaction: registrationTransaction });

        // If phone number doesn't exist, create a new entry, else use existing one
        const phoneDetail = (existingPhoneNumber) ? existingPhoneNumber : await PhoneNumber.create({ number: phoneNumber }, { transaction: registrationTransaction });

        // Create register details entry
        const userInfo = await ContactDirectory.create({ name, email, isUserDetails: true, userId: user.id, phoneId: phoneDetail.id }, { transaction: registrationTransaction });

        return { user, phoneDetail, userInfo };
      });

      // Generate register info Based Token 
      const token = commonServices.generateToken(result.userInfo.id);

      // Create response of user details 
      const data = {
        id: result.userInfo.id,
        name,
        phoneNumber,
        email,
        token
      }

      // Send Successful Response 
      return handleResolve({
        res: this.res,
        status: HTTP_CODE.RESOURCE_CREATED_CODE,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        data,
        message: 'Login Successfully.'
      });
    } catch (error) {
      if (commonServices.databaseUniqConstrainViolation(error)) {
        /**** Manage Database unique value field Error and Response */
        return commonServices.handleDatabaseUniqConstrainViolation(this.res, error.fields)
      } else {
        console.log(error, 'register()');
        /**** Manage Error logs and Response */
        return handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SERVER_ERROR_CODE,
          'An error occurred while registering.'
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
      // Check for phone number if exists
      const existingPhoneNumber = await PhoneNumber.findOne({
        where: { number: phoneNumber }
      });

      // If exist phone number exists, check for register details
      if (existingPhoneNumber) {
        // Check for register details, Populate other required details
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

        // If user register details not found send acknowledge response
        if (!userDetails) {
          return handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.NOT_FOUND_CODE,
            'User not found.'
          );
        }

        // verify the password
        const isPasswordValid = await commonServices.verifyPassword(password, userDetails['User.password']);

        // If not send acknowledge response
        if (!isPasswordValid) {
          return handleReject(
            this.res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            'Invalid credentials.'
          );
        }

        // Generate token for authentication 
        const token = commonServices.generateToken(userDetails.id);

        // Create user details response
        const data = {
          id: userDetails.id,
          name: userDetails.name,
          phoneNumber,
          email: userDetails.email,
          token
        }

        /**** Send Successful Response */
        return handleResolve({
          res: this.res,
          status: HTTP_CODE.RESOURCE_CREATED_CODE,
          statusCode: HTTP_CODE.SUCCESS_CODE,
          data,
          message: 'Login Successfully.'
        });
      }

      // No user entry with this phone number
      return handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.NOT_FOUND_CODE,
        'User not found.'
      );
    } catch (error) {
      console.log(error, 'login()');
      /**** Manage Error logs and Response */
      return handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        'An error occurred while registering.'
      );
    }
  };
};
