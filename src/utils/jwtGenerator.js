/*
    JavaScript file that handles the generation and distribution of JSON web tokens
*/
const jwt = require("jsonwebtoken");
require('dotenv').config();

const jwtGenerator = (staff_member_id) => {
    const payload = {
        staff_member: staff_member_id
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1hr"});
}

module.exports = jwtGenerator;