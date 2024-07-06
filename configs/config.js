/****************************
 Configuration
 ****************************/
require('dotenv').config();


module.exports = {
    DB: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT ?? 'postgres',
        enableSSL: process.env.DB_ENABLE_SSL
    },
    SERVER: {
        port: process.env.SERVER_PORT,
        baseApiUrl:'/api'
    },
    JWT: {
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_TOKEN_EXPIRE_TIME: process.env.JWT_TOKEN_EXPIRE_TIME
    }
};