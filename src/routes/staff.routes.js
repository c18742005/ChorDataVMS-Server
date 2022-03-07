/*
  File that handles the staff routes
*/
const router = require('express-promise-router')();
const staffController = require('../controllers/staff.controller');
const authorisation = require("../middleware/authorisation");

// Route to retrieve a staff member
router.get('/staff', authorisation, staffController.loadStaffMember);

module.exports = router;