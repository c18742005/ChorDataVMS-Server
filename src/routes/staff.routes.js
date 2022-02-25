const router = require('express-promise-router')();
const staffController = require('../controllers/staff.controller');
const authorisation = require("../middleware/authorisation");

// Route to create a client 
router.get('/staff', authorisation, staffController.loadStaffMember);

module.exports = router;