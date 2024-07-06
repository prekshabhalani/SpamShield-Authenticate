const { validationResult, query } = require('express-validator');

/********************************************************
  @Method POST 
  @Route '/search_by_name'
********************************************************/
const searchNumberValidation = [
  query('phoneNumber').matches(/^\+?\d+$/).withMessage('Valid number is required'),
];

/********************************************************
  @Method POST 
  @Route '/search_by_phone_number'
********************************************************/
const searchNameValidation = [query('searchQuery').isString().withMessage('Valid name is required')];

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

module.exports = { searchNumberValidation, searchNameValidation, validate };
