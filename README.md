# SpamShield-Authenticate
Rest APIs for the mobile app which tell you if a number is spam, or allow you to find a person’s name by searching for their phone number.

## Prerequisites
Before you get started, make sure you have the following versions installed:

| Module    | Version |
| --------- | ------- |
| Node      | 16.17.1 |
| Npm       | 8.15.0  |
| Sequelize | 6.37.3  |
| pg        | 8.12.0  |
| pg-hstore | 2.3.4   |


## Installation
Follow these steps to get the project up and running on your local machine:

```bash
# 1. Clone the repository
$ git clone 

# 2. Checkout to a new branch (following coding standards)
$ git checkout -b main  # Replace 'new-branch-name' with your branch name

# 3. Copy the sample environment configuration file
$ mv .env.sample .env

# 4. Edit the .env file to set up environment-specific details
$ vi .env  # Or use your preferred text editor to edit the .env file

# 5. Install the project dependencies
$ npm install

# 6. Start the application
$ node server.js
```

##### Directory Structure

SpamShield-Authenticate/
├── app/
│   └── modules/
│       ├── auth/
│       │   ├── Controller.js
│       │   ├── Routes.js
│       │   ├── projection.json
│       │   └── validator.js
│       ├── contacts/
│       │   ├── Controller.js
│       │   ├── Routes.js
│       │   └── Schema.js
│       │   ├── projection.json
│       │   └── validator.js
│       ├── spam/
│       │   ├── Controller.js
│       │   ├── Routes.js
│       │   └── Schema.js
│       │   ├── projection.json
│       │   └── validator.js
│       └── user/
│           ├── Controller.js
│           ├── Routes.js
│           └── Schema.js
│           ├── projection.json
│           └── validator.js
└── services/
│       ├── middleware.js
│       ├── commonServices.js
│       └── constant.js
├── configs/
│   ├── config.js
│   └── database.js
├── node_modules
├── package.json
├── server.js
├── .gitignore
└── README.md
