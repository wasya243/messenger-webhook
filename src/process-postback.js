const fetch = require('node-fetch');

const sendTextMessage = require('./send-message');

const {FACEBOOK_ACCESS_TOKEN} = process.env;

module.exports = async (event) => {
  const payload = event.postback.payload;
  const senderID = event.sender.id;

  if(payload === 'WELCOME') {
      // prepare fields to fetch in order to compose greeting message
      const fieldsToFetch = 'first_name';

      const response = await fetch(
          `https://graph.facebook.com/v5.0/${senderID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=${fieldsToFetch}`,
          { method: 'GET' }
      );

      const userInfo = await response.json();

      // compose response message to pressing Get started button
      const greeting = `Hello ${userInfo.first_name}.`;
      const message = `${greeting} Welcome to my chatbot!`;

      return sendTextMessage(senderID, message);
  }
};