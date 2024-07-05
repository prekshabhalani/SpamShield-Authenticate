

const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const { SpamList } = require('../spam/Schema');
const { User } = require('../users/Schema');
const { PhoneNumber, ContactDirectory } = require('./Schema');

module.exports = class ContactController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }
    /********************************************************
           @Purpose Get Person Details by Phone Number 
           @Parameter {
               id: //User's details id
           }
           @Return JSON String
       ********************************************************/

    async getPersonDetails() {
        try {
            const { id } = this.req.query;
            const currentUser = this.req.currentUser;

            // Find the contact directory details by ID
            const contactDetail = await ContactDirectory.findOne({
                where: { id },
                include: [
                    {
                        model: PhoneNumber,
                        include: [SpamList]
                    },
                    {
                        model: User
                    }
                ]
            });

            if (!contactDetail) {
                return handleReject(
                    this.res,
                    HTTP_CODE.NOT_FOUND,
                    HTTP_CODE.NOT_FOUND_CODE,
                    "Person details not found."
                );
            }

            // Get spam count
            const spamCount = await SpamList.count({
                where: { PhoneNumberId: contactDetail.phoneId }
            });

            // Base on person is registered or not a registered user or the current user is in or not in the contact list, include the email
            let includeEmail = false;
            // Check if the person is a registered user
            if (contactDetail.isUserDetails) {

                // Check if the current user is in the person's contact list
                const isContact = await ContactDirectory.findOne({
                    where: {
                        userId: contactDetail.User.id,
                        phoneId: currentUser["PhoneNumber.id"]
                    }
                });

                // If the user is in the contact list, include the email
                if (isContact) {
                    includeEmail = false
                }
            }

            // Create required response with details
            const result = {
                id: contactDetail.id,
                email: includeEmail ? contactDetail.email : null,
                name: contactDetail.name,
                isUserDetails: contactDetail.isUserDetails,
                userId: contactDetail.userId,
                phoneId: contactDetail.phoneId,
                phoneNumber:contactDetail.PhoneNumber.number,
                spamCount: spamCount
            };

            return handleResolve({
                res: this.res,
                status: HTTP_CODE.SUCCESS_CODE,
                statusCode: HTTP_CODE.SUCCESS_CODE,
                data: result,
                message: "Person's details fetched successfully."
            });

        } catch (error) {
            console.log(error, "getPersonDetails()");
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "An error occurred while processing."
            );
        }
    }

}