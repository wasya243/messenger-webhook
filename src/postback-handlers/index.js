const mongoose = require('mongoose');
const mongooseTypes = mongoose.Types;

const {User} = require('../db/models/user');
const {Reminder} = require('../db/models/reminder');
const {sendTextMessage, sendReminders} = require('../helpers');

// TODO: think of error handling
// TODO: I din't find any other way to pass reminder id other than payload. Try to find a new solution if it exists.

async function removeReminder(payload, senderID) {
    const reminderId = mongooseTypes.ObjectId(payload.split('/').pop());

    await Reminder.findByIdAndDelete(reminderId);

    return sendTextMessage(senderID, `Reminder is deleted successfully`);
}

async function muteReminder(payload, senderID) {
    const reminderId = mongooseTypes.ObjectId(payload.split('/').pop());

    await Reminder.findOneAndUpdate({_id: reminderId}, {$set: {isMuted: true}}, {new: true});

    return sendTextMessage(senderID, `Reminder is muted successfully`);
}

async function unmuteReminder(payload, senderID) {
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

    return sendReminders(senderID, userReminders);
}

module.exports = {
    removeReminder,
    unmuteReminder,
    muteReminder,
    getRemindersList
};

