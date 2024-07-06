const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const Controller = require('../Base/Controller');
const { PhoneNumber } = require('../contacts/Schema');
const { SpamList } = require('../spam/Schema');

module.exports = class SpamController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
    @Purpose Spam Number By Login User 
    @Parameter {
      phoneNumber: 9265000026
    }
    @Return JSON String
  ********************************************************/
  async spamPhoneNumber() {
    try {
      const { phoneNumber } = this.req.body;

      // Set current user
      const currentUser = this.req.currentUser;
      // Check if the phone number exists
      let phoneDetail = await PhoneNumber.findOne({
        where: { number: phoneNumber }
      });

      // If phone number doesn't exist, create a new entry
      if (!phoneDetail) {
        phoneDetail = await PhoneNumber.create({ number: phoneNumber });
      }

      // Check if same phone number is already as spam by user
      const hasAlreadySpam = await SpamList.findOne({
        where: {
          PhoneNumberId: phoneDetail.id,
          markedById: currentUser['User.id']
        }
      });

      //If already spam by user skip process and send response
      if (!hasAlreadySpam) {
        // Mark the phone number as spam
        await SpamList.create({
          PhoneNumberId: phoneDetail.id,
          markedById: currentUser['User.id']
        });
      }

      // Manage Resolve Response
      return handleResolve({
        res: this.res,
        status: HTTP_CODE.RESOURCE_CREATED_CODE,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: 'Phone number marked as spam successfully.'
      });
    } catch (error) {
      console.log(error, 'spamPhoneNumber()');
      // Manage Error logs and Response
      return handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        'An error occurred while processing.'
      );
    }
  };
};
