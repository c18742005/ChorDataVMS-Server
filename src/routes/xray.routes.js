/*
  JS file that handles all xray routes
*/
const router = require('express-promise-router')();
const authorisation = require("../middleware/authorisation");
const xrayController = require('../controllers/xray.controller');
const xrayValidator = require("../middleware/xrayValidator");

// Route to add an xray to log
router.post(
  '/xrays', 
  authorisation,
  xrayValidator.validate('validateXrayForm'), 
  xrayController.addXray
); 

// Route to get all xrays of a clinic by the clinic ID
router.get('/xrays/clinic/:id', authorisation, xrayController.findXraysByClinicId);

// Route to get all xrays of a patient by a patient ID
router.get('/xrays/patient/:id', authorisation, xrayController.findXraysByPatientId);

// Route to update an xray by their ID 
router.put(
  '/xrays/:id', 
  authorisation,
  xrayValidator.validate('validateXrayForm'), 
  xrayController.updateXrayById
);

module.exports = router;