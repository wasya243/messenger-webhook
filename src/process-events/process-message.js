const dialogflow = require('dialogflow');
const uuid = require('uuid');

const {sendTextMessage} = require('../helpers/index');
const {reminderBuffer} = require('./process-postback');
const {Reminder} = require('../db/models/reminder');
const {User} = require('../db/models/user');

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

    if(reminderBuffer[userId]) {
        if(reminderBuffer[userId].createReminderIsPressed.status) {
            reminderBuffer[userId].reminderTextIsEntered = {status: true, text: message};
            const user = await User.findOne({facebookID: userId});

            const reminderData = {user: user._id, comment: reminderBuffer[userId].reminderTextIsEntered.text };

            await new Reminder(reminderData).save();

            await sendTextMessage(userId, 'Reminder is successfully created');

            reminderBuffer[userId].reminderIsCreated = {status: true};
            delete reminderBuffer[userId];
        }
    } else {
        // TODO: start using dialogflow api to fetch data from reminder text

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
    }
};