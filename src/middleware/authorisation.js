/*
    JavaScript file that checks staff member is authorised i.e. has a JWT
*/
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header("token");

    // Check if not token
    if(!token) {
        return res.status(403).json("Unauthorised");
    }

    // Verify token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.staff_member = payload.staff_member;

        next();
    } catch (err) {
        res.status(401).json("Invalid token");
    }
};