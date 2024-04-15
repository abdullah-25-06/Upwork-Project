// Define a custom error class
class CustomErrorApi extends Error {
  constructor(message, statusCode) {
    // Call the Error constructor with the provided message
    super(message);
    // Assign the status code to the instance property
    this.statusCode = statusCode;
  }
}

// Export the CustomErrorApi class for use in other modules
module.exports = CustomErrorApi;
