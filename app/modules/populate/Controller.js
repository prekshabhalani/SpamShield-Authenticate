const commonServices = require('../../services/commonServices');
const { handleReject, handleResolve } = require('../../services/commonServices');
const { HTTP_CODE, TYPE_OF_PHONE_NUMBER } = require('../../services/constant');
const { PhoneNumber, ContactDirectory } = require('../contacts/Schema');
const { faker } = require('@faker-js/faker');
const { User } = require('../users/Schema');
const { SpamList } = require('../spam/Schema');
const { sequelizeConnection } = require('../../../configs/database');
const { param } = require('express-validator');
module.exports = class SeedController {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    async generateSeedData() {
        try {
            const users = [];
            const phoneNumbers = [];
            const contactNumbers = [];
            const numberOfSpamData = 50;
            const numberOfContacts = 100;
            const numberOfUsers = 5;

            await sequelizeConnection.sync({ force: true });

            // Generate Register Users 
            for (let i = 0; i < numberOfUsers; i++) {

                //step 1- Create user
                const password = faker.internet.password()
                const user = await this.registerUser(password);

                //step 2- Create phoneNumber
                const phoneNumber = faker.string.numeric({ length: { min: 7, max: 10 } });
                const phoneDetail = await this.registerPhoneNumber(phoneNumber);
                phoneNumbers.push(phoneDetail);

                // Create register details entry
                let userInfo = {
                    name: faker.person.fullName(),
                    email: Math.round(Math.random()) ? faker.internet.email() : null, //Email is optional
                    userId: user.id,
                    phoneId: phoneDetail.id,
                    isUserDetails: true
                }
                userInfo = await this.registerUserInfo(userInfo);

                delete userInfo.dataValues.isUserDetails;
                delete userInfo.dataValues.createdAt;
                delete userInfo.dataValues.updatedAt;
                users.push({ phoneNumber, password, ...userInfo.dataValues });
            }

            // Generate contacts of register Users 30% with register user and 70% with other 
            for (let i = 0; i < numberOfContacts; i++) {

                //Create contact details of register user
                let phoneDetail;
                if (this.randomBooleanWithProbability(30)) { //30% chance of being true
                    phoneDetail = faker.helpers.arrayElement(phoneNumbers)
                } else {
                    phoneDetail = await this.registerPhoneNumber(faker.string.numeric({ length: { min: 7, max: 10 } }))
                    contactNumbers.push(phoneDetail)
                }

                const userInfo = {
                    name: faker.person.fullName(),
                    email: Math.round(Math.random()) ? faker.internet.email() : null, //Email is optional
                    userId: faker.helpers.arrayElement(users).userId,
                    phoneId: phoneDetail.id
                }
                await this.registerUserInfo(userInfo)
            }

            //Spam register/contact/random user number
            for (let i = 0; i < numberOfSpamData; i++) {
                // random number(50%), contact number(30%) ,users number(20%)
                let phoneNumber = await this.getPhoneNumberForSpam(phoneNumbers, contactNumbers);

                //Spam numbers of register user
                await this.spamNumber(phoneNumber.id, faker.helpers.arrayElement(users).userId);
            }

            /**** Manage Resolve Response */
            const data = await this.generateResponseData(users);
            return handleResolve({
                res: this.res,
                status: HTTP_CODE.SUCCESS,
                statusCode: HTTP_CODE.SUCCESS_CODE,
                data,
                message: 'Good To Go:)'
            });

        } catch (error) {
            console.log("getSeedData()", error)
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "Something went wrong! Please try again!"
            );
        }
    }

    randomBooleanWithProbability(probability) {
        return faker.number.int({ min: 0, max: 99 }) < probability;
    }

    getRandomNumberWithProbability(get50Percentage, get30Percentage, get20Percentage) {
        const randomValue = faker.number.int({ min: 1, max: 100 });

        if (randomValue <= 50) {
            return get50Percentage; // 50% chance
        } else if (randomValue <= 80) {
            return get30Percentage; // 30% chance
        } else {
            return get20Percentage; // 20% chance
        }
    }

    async getPhoneNumberForSpam(phoneNumbers, contactNumbers) {
        try {
            let phoneNumberDetail;
            const typeOfNumber = this.getRandomNumberWithProbability(TYPE_OF_PHONE_NUMBER.RANDOM_NUMBER, TYPE_OF_PHONE_NUMBER.CONTACT_NUMBER, TYPE_OF_PHONE_NUMBER.USER_NUMBER)

            switch (typeOfNumber) {
                case TYPE_OF_PHONE_NUMBER.RANDOM_NUMBER:
                    // Spam any random number
                    const phoneNumber = faker.string.numeric({ length: { min: 7, max: 10 } });
                    phoneNumberDetail = await this.registerPhoneNumber(phoneNumber);
                    break;
                case TYPE_OF_PHONE_NUMBER.CONTACT_NUMBER:
                    //Spam contact number of any user
                    phoneNumberDetail = faker.helpers.arrayElement(contactNumbers)
                    break;
                default:
                    //Spam register user's number
                    phoneNumberDetail = faker.helpers.arrayElement(phoneNumbers)
                    break;
            }

            return phoneNumberDetail;
        } catch (error) {
            console.log("getPhoneNumberForSpam()", error)
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "Something went wrong! Please try again!"
            );
        }
    }

    async spamNumber(PhoneNumberId, markedById) {
        try {
            const data = { PhoneNumberId, markedById }
            // Check if same phone number is already as spam by user
            let spamEntry = await SpamList.findOne({ where: data });

            //If already spam by user skip process and send response
            if (!spamEntry) {
                // Mark the phone number as spam
                await SpamList.create(data);
            }
            return spamEntry;
        } catch (error) {
            console.log("spamNumber(PhoneNumberId, markedById)", error)
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "Something went wrong! Please try again!"
            );
        }
    }

    async registerUser(password) {
        try {
            //Hashed a password
            const hashedPassword = await commonServices.encryptPassword(password)

            const userDetail = await User.create({ password: hashedPassword });

            return userDetail;
        } catch (error) {
            console.log("registerUser(password)", error)
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "Something went wrong! Please try again!"
            );
        }

    }

    async registerPhoneNumber(number) {
        try {
            let phoneDetail = await PhoneNumber.findOne({ where: { number } });

            if (!phoneDetail) {
                phoneDetail = await PhoneNumber.create({ number });
            }
            return phoneDetail;
        } catch (error) {
            console.log("registerPhoneNumber(number)", error)
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "Something went wrong! Please try again!"
            );
        }
    }

    async registerUserInfo({ name, email = null, userId, phoneId, isUserDetails = false }) {
        try {

            let userInfo = await ContactDirectory.findOne({ where: arguments[0] });

            if (!userInfo) {
                userInfo = await ContactDirectory.create(arguments[0]);
            }

            return userInfo;
        } catch (error) {
            console.log("registerUserInfo", error)
            /**** Manage Error logs and Response */
            return handleReject(
                this.res,
                HTTP_CODE.FAILED,
                HTTP_CODE.SERVER_ERROR_CODE,
                "Something went wrong! Please try again!"
            );
        }
    }

    async generateResponseData(users) {
        let responseData = []

        for (const user of users) {
            let contacts = await ContactDirectory.findAll({
                where: { userId: user.userId, isUserDetails: false },
                include: [
                    {
                        model: PhoneNumber,
                        attributes: ["number"]
                    }
                ],
                attributes: ["name", "email", "id"]
            });
            contacts = contacts.map(item => ({
                id: item.dataValues.id,
                name: item.dataValues.name,
                email: item.dataValues.email,
                number: item.dataValues.PhoneNumber.number
            }))
            let spams = await SpamList.findAll({
                where: { markedById: user.userId },
                include: [
                    {
                        model: PhoneNumber,
                        attributes: ["number"]
                    }
                ],
                attributes: ["id"]
            });
            spams = spams.map(item => ({ number: item.dataValues.PhoneNumber.number, id: item.dataValues.id }))
            responseData.push({ user, contacts, spams })
        }
        return responseData
    }
}
