const router = require('express-promise-router')();
const clientController = require('../controllers/client.controller');
const clientValidator = require("../middleware/clientValidator");

// Route to create a client 
router.post(
  '/clients', 
  clientValidator.validate('validateClientForm'), 
  clientController.createClient
); 

// Route to get all clients
router.get('/clients', clientController.listAllClients);

// Route to get a client by their ID 
router.get('/clients/:id', clientController.findClientById);

// Route to get a client by a clinics ID
router.get('/clients/clinic/:id', clientController.findClientByClinicId);

// Route to update a client by their ID 
router.put(
  '/clients/:id', 
  clientValidator.validate('validateClientForm'), 
  clientController.updateClientById
);

// Route to deactivate a client by their ID 
router.put('/clients/deactivate/:id', clientController.deactivateClientById);

// Route to reactivate a client by their ID 
router.put('/clients/reactivate/:id', clientController.reactivateClientById);

// Route to delete a client by their ID
router.delete('/clients/:id', clientController.deleteClientById);

module.exports = router;