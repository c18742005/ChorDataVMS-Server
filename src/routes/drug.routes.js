/*
  File that handles the drug routes
*/
const router = require('express-promise-router')();
const drugController = require('../controllers/drug.controller');
const drugValidator = require("../middleware/drugValidator");
const authorisation = require("../middleware/authorisation");

// Route to get all drugs
router.get('/drugs', authorisation, drugController.listAllDrugs);

// Route to get drugs by their clinic ID 
router.get('/drugs/:id', authorisation, drugController.findDrugsStockByClinic);

// Route to get a drug log by their clinic ID and drug ID
router.get('/drugs/log/:drugid/:clinicid', authorisation, drugController.findDrugLogByClinic);

// Route to get a specific drug by their clinic ID 
router.get('/drugs/:drugid/:clinicid', authorisation, drugController.findDrugStockByClinic);

// Route to add drugs by their clinic ID 
router.post('/drugs', authorisation, drugValidator.validate('validateStockForm'), drugController.addDrugStockToClinic);

// Route to add drug to the drug log 
router.post('/drugs/log', authorisation, drugValidator.validate('validateDrugGiven'), drugController.administerDrug);

module.exports = router;