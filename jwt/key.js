// Import the crypto module
const crypto = require("crypto");

// Generate a random string of hexadecimal characters
const jtis = crypto.randomBytes(64).toString("hex");

// Output the generated random string
console.log(jtis);
