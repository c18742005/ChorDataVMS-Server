const router = require('express-promise-router')();
const patientController = require('../controllers/patient.controller');
const patientValidator = require("../middleware/patientValidator");

// Route to create a patient
router.post(
  '/patients', 
  patientValidator.validate('validatePatientForm'), 
  patientController.createPatient
);

// Route to get all patients
router.get('/patients', patientController.listAllPatients);

// Route to get a patient by patientID 
router.get('/patients/:id', patientController.findPatientById);

// Route to get a patient by clientID 
router.get('/patients/client/:id', patientController.findPatientByClientId);

// Route to get a patient by clinicID 
router.get('/patients/clinic/:id', patientController.findPatientByClinicId);

// Route to update a patient by their ID 
router.put(
  '/patients/:id', 
  patientValidator.validate('validatePatientForm'), 
  patientController.updatePatientById);

// Route to deactivate a patient by their ID 
router.put('/patients/deactivate/:id', patientController.deactivatePatientById);

// Route to reactivate a patient by their ID
router.put('/patients/reactivate/:id', patientController.reactivatePatientById);

// Route to delete a patient by their ID
router.delete('/patients/:id', patientController.deletePatientById);

module.exports = router;