const mongoose = require('mongoose');
const mongooseTypes = mongoose.Types;

const {User} = require('../db/models/user');
const {Reminder} = require('../db/models/reminder');
const {sendTextMessage, sendReminders, getUserInfo} = require('../helpers');

// TODO: think of error handling
// TODO: I din't find any other way to pass reminder id other than payload. Try to find a new solution if it exists.

async function removeReminder(payload, senderID) {
    const reminderId = mongooseTypes.ObjectId(payload.split('/').pop());

    await Reminder.findByIdAndDelete(reminderId);

    return sendTextMessage(senderID, `Reminder is deleted successfully`);
}

async function muteReminder(payload, senderID) {
    // TODO: add scheduling when I have time (unschedule) https://www.npmjs.com/package/node-schedule
    const reminderId = mongooseTypes.ObjectId(payload.split('/').pop());

    await Reminder.findOneAndUpdate({_id: reminderId}, {$set: {isMuted: true}}, {new: true});

    return sendTextMessage(senderID, `Reminder is muted successfully`);
}

async function unmuteReminder(payload, senderID) {
    // TODO: add scheduling when I have time https://www.npmjs.com/package/node-schedule
    const reminderId = mongooseTypes.ObjectId(payload.split('/').pop());

    await Reminder.findOneAndUpdate({_id: reminderId}, {$set: {isMuted: false}}, {new: true});

    return sendTextMessage(senderID, `Reminder is unmuted successfully`);
}

async function getRemindersList(senderID) {
    const [user] = await User.aggregate([
        {
            $match: {
                facebookID: senderID
            }
        },
        {
            $lookup: {
                localField: '_id',
                from: 'reminders',
                foreignField: 'user',
                as: 'reminders'
            }
        }
    ]);
    const userReminders = (user.reminders) || [];
    // I know that it is better to do a db sorting (unwind->sort->group->project), but in this case we'll work with small volumes of data
    // and it is faster to implement this solution
    userReminders.sort((reminder1, reminder2) => reminder1.createdAt - reminder2.createdAt);

    return sendReminders(senderID, userReminders);
}

async function gettingStarted(senderID) {
    const fieldsToFetch = ['first_name', 'last_name'];

    const response = await getUserInfo(senderID, fieldsToFetch);
    const userInfo = await response.json();

    const createdUser = await new User({
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        facebookID: userInfo.id
    }).save();

    const greeting = `Hello ${createdUser.firstName} ${createdUser.lastName}.`;
    const message = `${greeting} Welcome to my chatbot!`;

    return sendTextMessage(senderID, message);
}

module.exports = {
    removeReminder,
    unmuteReminder,
    muteReminder,
    getRemindersList,
    gettingStarted
};

