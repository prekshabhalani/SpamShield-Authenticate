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

# 7. Seed Random Data (GET - https://spamshield-authenticate.onrender.com/api/seed_data)
```

##### Directory Structure

SpamShield-Authenticate/
├── app/
│   └── modules/
│       ├── search/
│       │   ├── Controller.js
│       │   ├── Routes.js
│       │   └── validator.js
│       ├── contacts/
│       │   ├── Controller.js
│       │   ├── Routes.js
│       │   └── Schema.js
│       │   └── validator.js
│       ├── spam/
│       │   ├── Controller.js
│       │   ├── Routes.js
│       │   └── Schema.js
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


#### APIs 
URL - https://spamshield-authenticate.onrender.com 
BaseUrl - /api
Formate - URL/baseUrl/endpoint

## Home  GET /
    Description: Health check endpoint to ensure the server is running.
    Response: Status 200 with a message.

## User Registration POST /register
    Description: Registers a new user.
    Request Body:
    {
        name: John Doe,
        email: john@example.com, //Optional
        phoneNumber: 1234567,
        password: yourpassword
    }
    Response: Status 201 with user details or an error message.

## User Login POST /login
    Description: Authenticates a user.
    Request Body:
    {
        phoneNumber: 1234567,
        password: yourpassword
    }
    Response: Status 200 with a token or an error message.

## Mark Number as Spam get /spam
    Description: Marks a phone number as spam.
    Request Params:
    {
        "phoneNumber": "1234567890"
    }
    Response: Status 200 with a success message or an error message.

## Search by Phone Number GET /search_by_phone_number
    Description: Searches for a user details/contact details/random spam number details by their phone number.
    Request Params:
    {
        "phoneNumber": "1234567890"
    }
    Response: Status 200 with user details or an error message.

## Search by Name GET /search_by_name
    Description: Searches for a user details/contact details/random spam number details by their name.
    Request Params:
    {
       name: Preksha
    }
    Response: Status 200 with user details or an error message.

## Get Person Details GET /personDetails
    Description: Retrieves all details for a person based on searched result's clicked data. 
    Request Params:
    {
        "name": "preksha",
        "email": "preksha@gmail.com",
        "phoneNumber": "1234567890",
        "spamCount":5
        etc....
    }
    Response: Status 200 with person details, including spam likelihood, or an error message.


