const dialogflow = require('dialogflow');
const uuid = require('uuid');

// const sendTextMessage = require('./send-message');
const {sendTextMessage} = require('../helpers/index');

const {DIALOGFLOW_PRIVATE_KEY, DIALOGFLOW_CLIENT_EMAIL, PROJECT_ID} = process.env;

const projectId = PROJECT_ID;
const sessionId = uuid.v4();
const languageCode = 'en-US';

const config = {
    credentials: {
        private_key: DIALOGFLOW_PRIVATE_KEY,
        client_email: DIALOGFLOW_CLIENT_EMAIL
    }
};

const sessionClient = new dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

module.exports = async (event) => {
    const userId = event.sender.id;
    const message = event.message.text;

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // instead of logging
    console.log(`Dialogflow API response for ${message} is ${result.fulfillmentText}`);

    return sendTextMessage(userId, result.fulfillmentText);
};