const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config("./.env");

const connectToDatabase = async() => {
  try {
    const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`MongoDB Connected: ${connectioninstance.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
