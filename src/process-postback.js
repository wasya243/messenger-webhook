const fetch = require('node-fetch');
// const mongoose = require('mongoose');

const {User} = require('./db/models/user');
// const mongooseTypes = mongoose.Types;
// const {Reminder} = require('./db/models/reminder');

const sendTextMessage = require('./send-message');

const {muteReminder, unmuteReminder, removeReminder} = require('./postback-handlers');

const {FACEBOOK_ACCESS_TOKEN} = process.env;

function sendReminders(userId, reminders) {

    const elements = reminders.map(reminder => {
        return {
            image_url: 'https://ibb.co/xFmS8Z9',
            title: 'Reminder',
            subtitle: reminder.comment,
            buttons: [
                {
                    type: 'postback',
                    title: 'Delete',
                    payload: `REMOVE_REMINDER/${reminder._id}`
                },
                {
                    type: 'postback',
                    title: reminder.isMuted ? 'Unmute' : 'Mute',
                    payload: reminder.isMuted ? `UNMUTE_REMINDER/${reminder._id}` : `MUTE_REMINDER/${reminder._id}`
                }
            ]
        };
    });

    return fetch(
        `https://graph.facebook.com/v5.0/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                recipient: {
                    id: userId,
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements
                        }
                    }
                }
            }),
        }
    );
}

module.exports = async (event) => {
    const payload = event.postback.payload;
    const senderID = event.sender.id;

    // TODO: think of splitting postback handlers into separate functions
    if (payload === 'WELCOME') {
        // prepare fields to fetch in order to compose greeting message
        const fieldsToFetch = 'first_name,last_name';

        const response = await fetch(
            `https://graph.facebook.com/v5.0/${senderID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=${fieldsToFetch}`,
            {method: 'GET'}
        );

        const userInfo = await response.json();

        const createdUser = await new User({
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            facebookID: userInfo.id
        }).save();

        // compose response message to pressing Get started button
        const greeting = `Hello ${createdUser.firstName} ${createdUser.lastName}.`;
        const message = `${greeting} Welcome to my chatbot!`;

        return sendTextMessage(senderID, message);
    } else if (payload === 'GET_REMINDERS_LIST') {
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

    } else if (payload.includes('REMOVE_REMINDER')) {
        await removeReminder(payload, senderID);
    } else if (payload.startsWith('MUTE_REMINDER')) {
        await muteReminder(payload, senderID);
    } else if (payload.startsWith('UNMUTE_REMINDER')) {
        await unmuteReminder(payload, senderID);
    }
};