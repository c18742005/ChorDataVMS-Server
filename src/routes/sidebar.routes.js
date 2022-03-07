/*
  File that holds the sidebar routes
*/
const router = require('express-promise-router')();
const sidebarController = require('../controllers/sidebar.controller');
const authorisation = require("../middleware/authorisation");

// Route to get sidebar data
router.get('/sidebar', authorisation, sidebarController.loadSidebar);

module.exports = router;