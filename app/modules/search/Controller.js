const commonServices = require('../../services/commonServices');
const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE } = require('../../services/constant');
const { ContactDirectory, PhoneNumber } = require('../contacts/Schema');
const { SpamList } = require('../spam/Schema');
const { Op } = require('sequelize');
const { User } = require('../users/Schema');

module.exports = class SearchController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    /********************************************************
         @Purpose Search user by name 
         @Parameter {
             
         }
         @Return JSON String
     ********************************************************/

    async searchByName() {
        try {
            const { searchQuery } = this.req.query;
            const currentUser = this.req.currentUser
            // Search for names starting with the search query
            const nameStartsWith = await ContactDirectory.findAll({
                where: {
                    name: {
                        [Op.iLike]: `${searchQuery}%`
                    }
                },
                include: [
                    { model: PhoneNumber }
                ]
            });

            // Search for names containing the search query but not starting with it
            const nameContains = await ContactDirectory.findAll({
                where: {
                    name: {
                        [Op.and]: [
                            { [Op.iLike]: `%${searchQuery}%` },
                            { [Op.notILike]: `${searchQuery}%` }
                        ]
                    }
                },
                include: [
                    { model: PhoneNumber }
                ]
            });

            // Combine the results
            const results = [...nameStartsWith, ...nameContains];
            const userResults = await Promise.all(results.map(async (contact) => {

                //Find the spam count likelihood percentage
                const spamCount = await SpamList.count({ where: { PhoneNumberId: contact.phoneId } });
                const spamLikelihood = spamCount > 0 ? (spamCount / (spamCount + 1)) : 0;

                return {
                    id: contact.id,
                    name: contact.name,
                    phoneNumber: contact.PhoneNumber.number,
                    spamLikelihood,
                    spamCount
                };
            }));

            /**** Manage Resolve Response */
            return handleResolve({
                res: this.res,
                status: HTTP_CODE.SUCCESS_CODE,
                statusCode: HTTP_CODE.SUCCESS_CODE,
                data: userResults,
                message: 'Search results fetched successfully.'
            });

        } catch (error) {
            console.log(error, "searchByName()");
            // Manage Error logs and Response
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "An error occurred while processing."
            );
        }
    };

    /********************************************************
            @Purpose Search user by Phone number
            @Parameter {
                phoneNumber: // Phone number of user we are looking for
            }
            @Return JSON String
        ********************************************************/

    async searchByPhoneNumber() {
        try {
            const { phoneNumber } = this.req.query;

            // Find the phone number in the PhoneNumber table
            const phoneDetail = await PhoneNumber.findOne({
                where: { number: phoneNumber },
                include: [
                    {
                        model: ContactDirectory,
                        attributes: ["id", "isUserDetails", "name", "userId", "phoneId"]
                    },
                    {
                        model: SpamList
                    }
                ]
            });

            if (!phoneDetail) {
                return handleReject(
                    this.res,
                    HTTP_CODE.NOT_FOUND,
                    HTTP_CODE.NOT_FOUND_CODE,
                    "Phone number not found."
                );
            }
            // Calculate spam likelihood
            const spamCount = phoneDetail.SpamLists.length;
            const spamLikelihood = spamCount > 0 ? spamCount / (spamCount + 1) : 0;

            if(phoneDetail.ContactDirectories.length){// Check if there is a registered user with that phone number
            const registeredContact = phoneDetail.ContactDirectories.find(contact => contact.isUserDetails);

            if (registeredContact) {
                const result = {
                    id: registeredContact.id,
                    name: registeredContact.name,
                    isUserDetails: true,
                    userId: registeredContact.userId,
                    phoneId: registeredContact.phoneId,
                    phoneNumber,
                    spamCount: spamCount,
                    spamLikelihood
                };

                return handleResolve({
                    res: this.res,
                    status: HTTP_CODE.SUCCESS_CODE,
                    statusCode: HTTP_CODE.SUCCESS_CODE,
                    data: result,
                    message: 'Registered user found.'
                });
            } else {
                // Return all contact names for that phone number
                const results = phoneDetail.ContactDirectories.map(contact => ({
                    id: contact.id,
                    name: contact.name,
                    isUserDetails: false,
                    userId: contact.userId,
                    phoneNumber,
                    spamCount: spamCount,
                    spamLikelihood
                }));

                return handleResolve({
                    res: this.res,
                    status: HTTP_CODE.SUCCESS_CODE,
                    statusCode: HTTP_CODE.SUCCESS_CODE,
                    data: results,
                    message: 'Contacts found.'
                });
            }}

            return handleResolve({
                res: this.res,
                status: HTTP_CODE.SUCCESS_CODE,
                statusCode: HTTP_CODE.SUCCESS_CODE,
                data: {
                    phoneNumber,
                    spamCount: spamCount,
                    spamLikelihood
                },
                // data: registeredUserContact ? registeredUserContact : { contacts: phoneDetail.ContactDirectories },
                message: 'Non registered spam number.'
            });


        } catch (error) {
            console.log(error, "searchByPhoneNumber()");
            // Manage Error logs and Response
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "An error occurred while processing."
            );
        }
    };

}