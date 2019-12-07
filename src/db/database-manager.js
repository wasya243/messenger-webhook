const mongoose = require('mongoose');

const {MONGO_URL} = process.env;

class DatabaseManager {

    constructor() {
        mongoose.Promise = global.Promise;
    }

    async connect() {
        try {
            this.db = await mongoose.connect(MONGO_URL, {useNewUrlParser: true});
            console.log(`Database connection is established. MONGO URL is ${MONGO_URL}`);

            return this.db;
        } catch (error) {
            console.warn(`Failed to establish database connection. MONGO URL ${MONGO_URL}`);
            console.error(error);

            throw error;
        }
    }

}

module.exports = new DatabaseManager();