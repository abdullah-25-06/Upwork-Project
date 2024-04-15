// Importing the mongoose library for MongoDB database interaction
const mongoose = require("mongoose");

// Function to establish connection with the MongoDB database
const connectdb = async () => {
    try {
        // Attempting to connect to the MongoDB database using the provided URL
        const connect = await mongoose.connect(process.env.MONGO_URL);
        
        // Logging a message indicating successful database connection, including host and database name
        console.log(`DB connected : ${connect.connection.host} - ${connect.connection.name}`);
    } catch (error) {
        // Logging any errors that occur during the connection process
        console.log(error);
        // Exiting the process with a non-zero status code to indicate failure
        process.exit(1);
    }
};

// Exporting the connectdb function for use in other modules
module.exports = { connectdb };
