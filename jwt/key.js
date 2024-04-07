const crypto = require("crypto");

const jtis = crypto.randomBytes(64).toString("hex");
console.log(jtis)