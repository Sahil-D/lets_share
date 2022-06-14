const mongoose = require('mongoose');

require('dotenv').config();

function connectDB() {
  // Database connection
  mongoose
    .connect(process.env.MONGO_CONNNECTION_URL)
    .then((db) => {
      console.log('DB successfully connected');
    })
    .catch((err) => {
      console.log('Error connecting DB ', err);
    });
}

module.exports = connectDB;
