const mongoose = require('mongoose');
const fl = require("fluident");

module.exports = {
    init: () => {
        const dbOptions = {
            autoIndex: false,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            family: 4,
            serverSelectionTimeoutMS: 5000,
            heartbeatFrequencyMS: 10000,
        };

        mongoose.set('strictQuery', false);

        mongoose.connect(process.env.MongoURI, dbOptions)
        .then(() => {
            console.log(fl.green('[MONGOOSE] I have successfully connected to the Database!'));
        })
        .catch((err) => {
            console.error(fl.red(`[MONGOOSE] I have encountered an error: \n${err.stack}`));
        });

        mongoose.connection.on('connected', () => {
            console.log(fl.green('\n[MONGOOSE] Connection to the database established.'));
        });

        mongoose.connection.on('disconnected', () => {
            console.warn(fl.yellow('[MONGOOSE] Disconnected from the database.'));
        });

        mongoose.connection.on('error', (err) => {
            console.error(fl.red(`[MONGOOSE] Error encountered: \n${err.stack}`));
        });
    }
};
