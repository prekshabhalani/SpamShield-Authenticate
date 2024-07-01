/****************************
 Configuration
 ****************************/
// For environment variables [will work with .env file]
// require('custom-env').env("dev")
require('custom-env').env("dev")

const ENV_VARIABLES = process.env;
if (!process.env.SOME_REQUIRED_VARIABLE) {
    console.warn(`Warning: No environment file found for environment . Please ensure the '.env.' file is present.`);
}
module.exports = {
    ...ENV_VARIABLES,
};
