const processMessage = require('./process-message');

module.exports = (req, res) => {
    // according to the docs I should respond 200 ok to all webhook events
    res.status(200).end();

    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(async (event) => {
                try {
                    await processMessage(event);
                } catch (error) {
                    console.error(error);
                }
            })
        });
    }
};
