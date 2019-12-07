const fetch = require('node-fetch');

const {User} = require('./db/models/user');
// const {Reminder} = require('./db/models/reminder');

const sendTextMessage = require('./send-message');

const {FACEBOOK_ACCESS_TOKEN} = process.env;

// TODO: think of how to send list of reminders back
function composeMessageFromReminders(reminders) {
    return reminders.reduce((ac, cv) => {
        return `${ac}\n${cv.comment}`;
    }, '');
}

module.exports = async (event) => {
  const payload = event.postback.payload;
  const senderID = event.sender.id;
  // const recipientID = event.recipient.id;
  // TODO: think of splitting postback handlers into separate functions
  if(payload === 'WELCOME') {
      // prepare fields to fetch in order to compose greeting message
      const fieldsToFetch = 'first_name,last_name';

      const response = await fetch(
          `https://graph.facebook.com/v5.0/${senderID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=${fieldsToFetch}`,
          { method: 'GET' }
      );

      const userInfo = await response.json();

      const createdUser = await new User({firstName: userInfo.first_name, lastName: userInfo.last_name, facebookID: userInfo.id}).save();
      // const createdReminder = await new Reminder({user: createdUser.id, comment: `Test comment from user ${createdUser.id}`}).save();

      // compose response message to pressing Get started button
      const greeting = `Hello ${createdUser.firstName} ${createdUser.lastName}.`;
      const message = `${greeting} Welcome to my chatbot!`;

      return sendTextMessage(senderID, message);
  } else if(payload === 'GET_REMINDERS_LIST') {
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

      return sendTextMessage(senderID, composeMessageFromReminders(userReminders));
  }
};