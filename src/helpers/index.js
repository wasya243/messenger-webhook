const fetch = require('node-fetch');

const {FACEBOOK_ACCESS_TOKEN} = process.env;

function getUserInfo(userId, fields) {
    const fieldsToFetch = fields.join(',');

    return fetch(
        `https://graph.facebook.com/v5.0/${userId}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=${fieldsToFetch}`,
        {method: 'GET'}
    );
}

function sendTextMessage(userId, text) {
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
}

function sendReminders(userId, reminders) {

    const elements = reminders.map(reminder => {
        return {
            // TODO: think of how to send image
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

module.exports = {
    sendTextMessage,
    sendReminders,
    getUserInfo
};
