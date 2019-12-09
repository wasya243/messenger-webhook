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
            // image is not displayed if it is hosted from the same domain (((
            // image_url: 'https://68b0c637.ngrok.io/static/bell-muted.jpg',
            image_url: reminder.isMuted
                ? 'https://image.shutterstock.com/image-photo/image-150nw-746726305.jpg'
                : 'https://image.shutterstock.com/image-photo/image-150nw-152649632.jpg',
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
