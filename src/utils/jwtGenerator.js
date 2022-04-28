/*
    JavaScript file that handles the generation and distribution of JSON web tokens
*/
const jwt = require("jsonwebtoken");
require('dotenv').config();

const jwtGenerator = (staff_member) => {
    const payload = {
        staff_member: staff_member
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "8hr"});
}

module.exports = jwtGenerator;