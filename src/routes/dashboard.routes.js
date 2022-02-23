const router = require('express-promise-router')();
const dashboardController = require('../controllers/dashboard.controller');
const authorisation = require("../middleware/authorisation");

// Route to create a client 
router.get('/dashboard', authorisation, dashboardController.loadDashboard);

module.exports = router; 