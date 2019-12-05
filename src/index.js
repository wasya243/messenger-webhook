require('dotenv').config({ path: '.env' });

const express = require('express');
const bodyParser = require('body-parser');

const {PORT} = process.env;

const verifyWebhook = require('./verify-webhook');
const messageWebhook = require('./message-webhook');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', verifyWebhook);
app.post('/', messageWebhook);

app.listen(PORT || 5000, () => console.log('Express server is listening on port 5000'));
