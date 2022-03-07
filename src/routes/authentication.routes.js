/*
    JavaScript file that models the APIs required for:
        * Logging in a staff member
        * Registering a staff member
        * Verifying a staff member
*/
const router = require('express-promise-router')();
const authenticationController = require('../controllers/authentication.controller');
const authorisation = require("../middleware/authorisation");
const validateForm = require("../middleware/authValidator");

// Register staff member 
router.post(
    '/register', 
    validateForm.validate('registerStaffMember'), 
    authenticationController.registerStaffMember
);

// Log in staff member
router.post(
    '/login', 
    validateForm.validate('loginStaffMember'), 
    authenticationController.loginStaffMember
);

// Check member is verified
router.get('/verify', authorisation, authenticationController.verifyStaffMember);

module.exports = router;  