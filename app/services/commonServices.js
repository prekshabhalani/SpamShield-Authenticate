const bcrypt = require('bcrypt');
const config = require('../../configs/config');
const { HTTP_CODE, DATABASE_VALIDATION } = require('./constant');
const jwt = require('jsonwebtoken');

class Common {
  /********************************************************
    @Purpose Handle Success Response
    @Parameter {
      res, status, statusCode, message, data,meta, page, perPage, total,readOnlyData
    }
    @Return JSON String
  ********************************************************/
  handleResolve(resolveParams) {
    const { res, status, statusCode, message, data, meta, page, perPage, total, readOnlyData } = resolveParams;
    return res
      .status(statusCode)
      .send({ status, statusCode, message, data, readOnlyData, page, perPage, total, extraMeta: meta });
  }

  /********************************************************
    @Purpose Handle Error Response
    @Parameter {
        res, status, statusCode, message
    }
    @Return JSON String
  ********************************************************/
  handleReject(res, status, statusCode, message, readOnlyData, errorMessage, errorKey) {
    let data = { status, statusCode, message };
    if (readOnlyData) {
      data.readOnlyData = readOnlyData;
    }
    if (errorMessage) {
      data.errorMessage = errorMessage;
    }
    if (errorKey) {
      data.errorKey = errorKey;
    }
    return res.status(statusCode).send(data);
  }

  /********************************************************
    @Purpose Encrypt password
    @Parameter {
      'password' : 'test123'
    }
    @Return String
  ********************************************************/
  encryptPassword(password) {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(bcrypt.hashSync(password, 10));
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
    @Purpose Compare password
    @Parameter {
        'password' : 'Buffer data', // Encrypted password
        'savedPassword': 'Buffer data' // Encrypted password
    }
    @Return Boolean
  ********************************************************/
  verifyPassword(password, savedPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        let base64data = Buffer.from(savedPassword, 'binary').toString();
        const isVerified = await bcrypt.compareSync(password, base64data);
        return resolve(isVerified);
      } catch (error) {
        console.error('verifyPassword(password, savedPassword)', error);
        return reject({ message: 'An error occurred while processing.', status: HTTP_CODE.FAILED });
      }
    });
  }

  /********************************************************
    @Purpose Generate JWT Token
    @Parameter {
        id // Uniq id to create token based on
    }
    @Return String
  ********************************************************/
  generateToken(id) { return jwt.sign({ id }, config.JWT.JWT_SECRET, { expiresIn: config.JWT.JWT_TOKEN_EXPIRE_TIME }) }

  /********************************************************
    @Purpose validate database uniq field error
    @Parameter {
        error // Cached error
    }
    @Return Boolean
  ********************************************************/
  databaseUniqConstrainViolation(error) { return (error.fields && error.parent && error.parent.code === DATABASE_VALIDATION.UNIQUE_CONSTRAINTS_VIOLATION) ? true : false }

  /********************************************************
    @Purpose Handle Error Response For Database Uniq Constrain Violation
    @Parameter {
        res, status, statusCode, message
    }
    @Return JSON String
  ********************************************************/
  handleDatabaseUniqConstrainViolation(res, fields) {
    return this.handleReject(
      res,
      HTTP_CODE.FAILED,
      HTTP_CODE.CONFLICT_CODE,
      `${Object.keys(fields)[0].charAt(0).toUpperCase() + Object.keys(fields)[0].slice(1)} already exist.`
    );
  }

  /********************************************************
    @Purpose check token's expiry
    @Parameter {
        token: // JWT token
    }
    @Return Boolean
  ********************************************************/
  checkTokenExpiry(token) {
    const currentTimeUTC = Math.floor(Date.now() / 1000);    
    return (currentTimeUTC >= token.exp) ? true : false; 
  }
}

module.exports = new Common();
