const { body, validationResult } = require('express-validator');

/********************************************************
  @Method POST 
  @Route '/register'
********************************************************/
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('email').isEmail().optional().withMessage('Valid email is required'),
];

/********************************************************
  @Method POST 
  @Route '/login'
********************************************************/
const loginValidation = [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/* express validate fields */
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

module.exports = { registerValidation, loginValidation, validate };
