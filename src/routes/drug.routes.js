const router = require('express-promise-router')();
const drugController = require('../controllers/drug.controller');
const drugValidator = require("../middleware/drugValidator");

// Route to get all drugs
router.get('/drugs', drugController.listAllDrugs);

// Route to get drugs by their clinic ID 
router.get('/drugs/:id', drugController.findDrugStockByClinic);

// Route to add drugs by their clinic ID 
router.post('/drugs', drugValidator.validate('validateStockForm'), drugController.addDrugStockToClinic);

// Route to add drug to the drug log 
router.post('/drugs/log', drugValidator.validate('validateDrugGiven'), drugController.administerDrug);

module.exports = router;