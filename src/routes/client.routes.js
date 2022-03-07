/*
  JS file that handles all client routes
*/
const router = require('express-promise-router')();
const authorisation = require("../middleware/authorisation");
const clientController = require('../controllers/client.controller');
const clientValidator = require("../middleware/clientValidator");

// Route to create a client 
router.post(
  '/clients', 
  authorisation,
  clientValidator.validate('validateClientForm'), 
  clientController.createClient
); 

// Route to get a client by their ID 
router.get('/clients/:id', authorisation, clientController.findClientById);

// Route to get all clients by a clinic ID
router.get('/clients/clinic/:id', authorisation, clientController.findClientsByClinicId);

// Route to update a client by their ID 
router.put(
  '/clients/:id', 
  authorisation,
  clientValidator.validate('validateClientForm'), 
  clientController.updateClientById
);

// Route to deactivate a client by their ID 
router.put('/clients/deactivate/:id', authorisation, clientController.deactivateClientById);

// Route to reactivate a client by their ID 
router.put('/clients/reactivate/:id', clientController.reactivateClientById);

// Route to delete a client by their ID
router.delete('/clients/:id', authorisation, clientController.deleteClientById);

module.exports = router;