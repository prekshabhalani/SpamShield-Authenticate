const { body, validationResult } = require('express-validator');

/********************************************************
       @Method POST 
       @Route '/spam'
   ********************************************************/
const spamNumberValidation = [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
];

/**** express validate fields */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = { spamNumberValidation, validate };
