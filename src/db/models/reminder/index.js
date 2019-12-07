const mongoose = require('mongoose');

const {reminderSchema} = require('./schema');

const Reminder = mongoose.model('Reminder', reminderSchema, 'reminders');

Reminder.defaultProjection = {comment: 1};

module.exports = {
    Reminder
};