const mongoose = require('mongoose');

const {Types: mongooseTypes} = mongoose.Schema;

// TODO: add constraints if needed
const userSchema = new mongoose.Schema({
    facebookID: {
        type: mongooseTypes.String,
        required: true
    },
    firstName: {
        type: mongooseTypes.String,
        required: true
    },
    // lastName: {
    //     type: mongooseTypes.String,
    //     required: true
    // },
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
    userSchema
};