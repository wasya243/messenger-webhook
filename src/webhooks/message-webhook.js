const processMessage = require('../process-events/process-message');
const {processPostback} = require('../process-events/process-postback');

module.exports = (req, res) => {
    // according to the docs I should respond 200 ok to all webhook events
    res.status(200).end();

    if (req.body.object === 'page') {
        req.body.entry.forEach(async(entry) => {
            try {
                // Gets the message. entry.messaging is an array, but
                // will only ever contain one message, so we get index 0
                const webhook_event = entry.messaging[0];

                // instead of logging
                console.log('sender id: ', webhook_event.sender.id);
                console.log('recipient id: : ', webhook_event.recipient.id);

                if(webhook_event.message) {
                    await processMessage(webhook_event)
                } else if(webhook_event.postback) {
                    await processPostback(webhook_event);
                }
            } catch (error) {
                console.error('Error is: ', error);
            }
        });
    }
};
