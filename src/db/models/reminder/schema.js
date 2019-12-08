const mongoose = require('mongoose');

const {Types: mongooseTypes} = mongoose.Schema;

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongooseTypes.ObjectId,
        required: true,
        ref: 'User'
    },
    // TODO: for the same of simplicity now we save just a comment
    comment: {
        type: mongooseTypes.String,
        required: true
    },
    isMuted: {
        type: mongooseTypes.Boolean,
        default: false
    },
    createdAt: {
        type: mongooseTypes.Date,
        default: Date.now()
    },
    updatedAt: {
        type: mongooseTypes.Date,
        default: Date.now()
    }
});

module.exports = {
    reminderSchema
};