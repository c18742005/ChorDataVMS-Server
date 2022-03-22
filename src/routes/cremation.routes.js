/*
  JS file that handles all cremation routes
*/
const router = require('express-promise-router')();
const authorisation = require("../middleware/authorisation");
const cremationController = require('../controllers/cremation.controller');

// Route to add a cremation to log
router.post(
  '/cremations', 
  authorisation,
  cremationController.addCremation
); 

// Route to get all cremations of a clinic by the clinic ID
router.get('/cremations/clinic/:id', authorisation, cremationController.findCremationsByClinicId);

// Route to update a cremation by its ID 
router.put(
  '/cremations/:id', 
  authorisation,
  cremationController.updateCremationById
);

// Route to delete a cremation by its ID 
router.delete(
  '/cremations/:id', 
  authorisation,
  cremationController.deleteCremationById
);

module.exports = router;