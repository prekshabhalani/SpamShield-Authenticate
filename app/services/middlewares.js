const jwt = require('jsonwebtoken');
const { ContactDirectory, PhoneNumber } = require('../modules/contacts/Schema');
const { HTTP_CODE } = require('./constant');
const commonServices = require('./commonServices');
const { User } = require('../modules/users/Schema');

class Middlewares {

  static isAuthenticateUser() {
    return async (req, res, next) => {
      try {

        /**** Get auth token from header */
        const token = req.headers.authorization;
        if (!token) {
          return commonServices.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            'Please send token with API.'
          );
        }

        const decoded = jwt.decode(token, process.env.JWT_SECRET);

        if (!decoded) {
          return commonServices.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.BAD_REQUEST_CODE,
            "Token is invalid."
          );
        }

        if (commonServices.checkTokenExpiry(decoded)) {
          return commonServices.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.BAD_REQUEST_CODE,
            "Token is expired."
          );
        }

        //Check for user exist in record
        const userDetails = await ContactDirectory.findOne({
          where: { id: decoded.id, isUserDetails: true },
          include: [
            {
              model: PhoneNumber,
              attributes: ['id', 'number']
            },
            {
              model: User,
              attributes: ['id']
            }
          ],
          attributes: ['id', 'email', 'name'],
          raw: true
        });

        //If user not exist
        if (!userDetails) {
          if (!userExist) {
            return commonServices.handleReject(
              res,
              HTTP_CODE.FAILED,
              HTTP_CODE.UNAUTHORIZED_CODE,
              "User Not found."
            );
          }
        }

        /**** Set user as current user */
        req.currentUser = userDetails;
        next();

      } catch (err) {
        console.log(err, "isAuthenticateUser()")
        return commonServices.handleReject(
          res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          "Please authenticate."
        );
      }

    };
  }
}

module.exports = Middlewares;
