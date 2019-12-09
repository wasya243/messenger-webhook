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

    // TODO: rework using redis when I have time
    if (reminderBuffer[userId]) {
        if (reminderBuffer[userId].createReminderIsPressed.status && !reminderBuffer[userId].reminderTextIsEntered.status) {
            reminderBuffer[userId].reminderTextIsEntered = {status: true, text: message};
            await sendTextMessage(userId, 'When should I remind you about it? Enter the date in mm/dd/yy format.');
        } else if (reminderBuffer[userId].reminderTextIsEntered.status && !reminderBuffer[userId].reminderDateIsEntered.status) {
            // TODO: add date validation & timezone when I have time
            // to fetch user time zone follow this --> https://stackoverflow.com/questions/37435222/how-can-we-get-fb-users-timezone-with-fb-sender-id-using-graph-api
            reminderBuffer[userId].reminderDateIsEntered = {status: true, date: new Date(message)};

            console.log('before new Date', message);
            console.log('after new Date', new Date(message));

            // find user to attach reminder to
            const user = await User.findOne({facebookID: userId});

            // compose reminder data from reminder buffer by user id
            const reminderData = {
                user: user._id,
                comment: reminderBuffer[userId].reminderTextIsEntered.text,
                dateOfAlert: reminderBuffer[userId].reminderDateIsEntered.date
            };

            await new Reminder(reminderData).save();

            // delete reminder from reminder buffer
            reminderBuffer[userId].reminderIsCreated = {status: true};
            delete reminderBuffer[userId];

            await sendTextMessage(userId, 'Reminder is successfully created');
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