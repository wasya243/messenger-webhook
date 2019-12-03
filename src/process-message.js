const fetch = require('node-fetch');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

const {FACEBOOK_ACCESS_TOKEN, DIALOGFLOW_PRIVATE_KEY, DIALOGFLOW_CLIENT_EMAIL, PROJECT_ID} = process.env;

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

const sendTextMessage =  (userId, text) => {
    return fetch(
        `https://graph.facebook.com/v5.0/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                messaging_type: 'RESPONSE',
                recipient: {
                    id: userId,
                },
                message: {
                    text,
                },
            }),
        }
    );
};

module.exports = async (event) => {
    const userId = event.sender.id;
    const message = event.message.text;

    // instead of logging
    console.log('sender id: ', event.sender.id);
    console.log('recipient id: : ', event.recipient.id);

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