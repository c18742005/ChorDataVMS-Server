const router = require('express-promise-router')();
const sidebarController = require('../controllers/sidebar.controller');
const authorisation = require("../middleware/authorisation");

// Route to create a client 
router.get('/sidebar', authorisation, sidebarController.loadSidebar);

module.exports = router;