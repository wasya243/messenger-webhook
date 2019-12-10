const {
    muteReminder,
    unmuteReminder,
    removeReminder,
    getRemindersList,
    gettingStarted
} = require('../postback-handlers/index');
const {sendTextMessage} = require('../helpers');


// TODO: rework with redis when I have time
const reminderBuffer = {};

// I know that shared variables are bad practice, but in this case it is needed
function initReminderStateForUser(userId) {
    reminderBuffer[userId] = {};
    reminderBuffer[userId].createReminderIsPressed = {status: true};
    reminderBuffer[userId].reminderTextIsEntered = {status: false, text: null};
    reminderBuffer[userId].reminderDateIsEntered = {status: false, date: null};
    reminderBuffer[userId].reminderIsCreated = {status: false}
}


async function processPostback(event) {
    const payload = event.postback.payload;
    const senderID = event.sender.id;

    if (payload === 'WELCOME') {
        await gettingStarted(senderID)
    } else if (payload === 'GET_REMINDERS_LIST') {
        await getRemindersList(senderID);
    } else if (payload.includes('REMOVE_REMINDER')) {
        await removeReminder(payload, senderID);
    } else if (payload.startsWith('MUTE_REMINDER')) {
        await muteReminder(payload, senderID);
    } else if (payload.startsWith('UNMUTE_REMINDER')) {
        await unmuteReminder(payload, senderID);
    } else if (payload === 'CREATE_REMINDER') {
        initReminderStateForUser(senderID);
        await sendTextMessage(senderID, 'What should I remind you about?');
    }
}

module.exports = {
    processPostback,
    reminderBuffer
};