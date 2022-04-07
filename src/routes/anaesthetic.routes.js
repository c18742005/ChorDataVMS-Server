const router = require('express-promise-router')();
const authorisation = require("../middleware/authorisation");
const anaestheticController = require('../controllers/anaesthetic.controller');
const validateForm = require("../middleware/anaestheticValidator");

// Route to get anaesthetics by a patient's ID 
router.get('/anaesthetic/:id', authorisation, anaestheticController.findAnaestheticsByPatientId);

// Route to get anaesthetic sheet and its periods by the anaesthetic sheet's ID
router.get('/patient/anaesthetic/:id', authorisation, anaestheticController.findAnaestheticById);

// Route to add an anaesthetic sheet
router.post(
  '/anaesthetic', 
  authorisation, 
  validateForm.validate('addAnaestheticSheet'), 
  anaestheticController.addAnaesthetic
);

// Route to add an anaesthetic period to a sheet
router.post(
  '/anaesthetic/period', 
  authorisation, 
  validateForm.validate('addAnaestheticPeriod'), 
  anaestheticController.addAnaestheticPeriod
);

module.exports = router;