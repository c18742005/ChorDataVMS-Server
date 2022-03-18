/*
  File that handles the patient routes
*/
const router = require('express-promise-router')();
const authorisation = require("../middleware/authorisation");
const patientController = require('../controllers/patient.controller');
const patientValidator = require("../middleware/patientValidator");

// Route to add a patient
router.post(
  '/patients', 
  authorisation,
  patientValidator.validate('validatePatientForm'), 
  patientController.createPatient
);

// Route to get a patient by patientID 
router.get('/patients/:id', authorisation, patientController.findPatientById);

// Route to get a patient by clientID 
router.get('/patients/client/:id', authorisation, patientController.findPatientByClientId);

// Route to get a patient by clinicID 
router.get('/patients/clinic/:id', authorisation, patientController.findPatientByClinicId);

// Route to get species patients by clinicID 
router.get('/patients/species/:species/clinic/:id', authorisation, patientController.findSpeciesByClinicId);

// Route to update a patient by their ID 
router.put(
  '/patients/:id', 
  authorisation,
  patientValidator.validate('validatePatientForm'), 
  patientController.updatePatientById);

// Route to deactivate a patient by their ID 
router.put('/patients/deactivate/:id', authorisation, patientController.deactivatePatientById);

// Route to reactivate a patient by their ID
router.put('/patients/reactivate/:id', patientController.reactivatePatientById);

// Route to delete a patient by their ID
router.delete('/patients/:id', authorisation, patientController.deletePatientById);

module.exports = router;