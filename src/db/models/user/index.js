const mongoose = require('mongoose');

const {userSchema} = require('./schema');

const User = mongoose.model('User', userSchema, 'users');

User.defaultProjection = {firstName: 1, lastName: 1};

module.exports = {
    User
};