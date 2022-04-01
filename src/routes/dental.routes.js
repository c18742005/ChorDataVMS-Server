/*
  File that handles the dental; routes
*/
const router = require('express-promise-router')();
const dentalController = require('../controllers/dental.controller');
const authorisation = require("../middleware/authorisation");
const dentalValidator = require("../middleware/dentalValidator");

// Route to get a dental by the patients ID
router.get('/dentals/:id', authorisation, dentalController.findDentalByPatientId);

// Route to add a dental by the patients ID
router.post('/dentals/:id', authorisation, dentalController.addDental);

// Route to update a tooth
router.put(
  '/dentals/tooth/:tooth_id/patient/:patient_id', 
  authorisation, 
  dentalValidator.validate('validateToothForm'), 
  dentalController.updateToothByToothIdAndPatientId);

module.exports = router;