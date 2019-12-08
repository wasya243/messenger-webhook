const {
    muteReminder,
    unmuteReminder,
    removeReminder,
    getRemindersList,
    gettingStarted
} = require('../postback-handlers/index');

module.exports = async (event) => {
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
    }
};