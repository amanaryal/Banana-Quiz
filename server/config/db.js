/*
 * Purpose: Opens the connection to MongoDB, where users and scores are stored.
 * Theme: Virtual identity
 */

const mongoose = require('mongoose');

// Connect once, when the server starts. Returns true if the database answered.
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is missing. Copy server/.env.example to server/.env');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isDatabaseConnected
};
