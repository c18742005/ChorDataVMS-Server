const router = require('express-promise-router')();
const clientController = require('../controllers/client.controller');

// Route to create a client 
router.post('/clients', clientController.createClient);

// Route to get all clients
router.get('/clients', clientController.listAllClients);

// Route to get a client by ID 
router.get('/clients/:id', clientController.findClientById);

// Route to update a client by their ID 
router.put('/clients/:id', clientController.updateClientById);

// Route to delete a client by their ID
router.delete('/clients/:id', clientController.deleteClientById);

module.exports = router;