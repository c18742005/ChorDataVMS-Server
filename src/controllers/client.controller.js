const db = require("../config/database");
const { validationResult } = require('express-validator')
 
// query to add a client
exports.createClient = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  const { 
    client_forename, 
    client_surname, 
    client_address, 
    client_city, 
    client_county,
    client_phone,
    client_email,
    client_clinic_id  } = req.body;

  const rows = await db.query(
    `INSERT INTO client(
      client_forename, 
      client_surname, 
      client_address, 
      client_city, 
      client_county, 
      client_phone, 
      client_email, 
      client_clinic_id ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      client_forename, 
      client_surname, 
      client_address, 
      client_city, 
      client_county, 
      client_phone, 
      client_email, 
      client_clinic_id]
  );

  res.status(201).send({
    message: "Client added successfully!",
    body: {
      client: { client_forename, 
        client_surname, 
        client_address, 
        client_city, 
        client_county, 
        client_phone, 
        client_email, 
        client_clinic_id }
    },
  });
};

// query to list all clients
exports.listAllClients = async (req, res) => {
  const response = await db.query('SELECT * FROM client');
  res.status(200).send(response.rows);
};

// query to get a client by their ID
exports.findClientById = async (req, res) => {
  const clientId = parseInt(req.params.id);
  const response = await db.query('SELECT * FROM client WHERE client_id = $1',
    [clientId]);
  res.status(200).send(response.rows);
};

// query to update a client by their ID
exports.updateClientById = async (req, res) => {
  const clientId = parseInt(req.params.id);
  const { 
    client_forename, 
    client_surname, 
    client_address, 
    client_city, 
    client_county,
    client_phone,
    client_email } = req.body;

  const response = await db.query(
    `UPDATE client 
    SET 
      client_forename = $1, 
      client_surname = $2, 
      client_address = $3, 
      client_city = $4, 
      client_county =$5, 
      client_phone = $6, 
      client_email = $7 
    WHERE client_id = $8`,
    [
      client_forename, 
      client_surname, 
      client_address, 
      client_city, 
      client_county, 
      client_phone, 
      client_email, 
      clientId
    ]
  );
  res.status(200).send({ message: "Client Updated Successfully!" });
};

// query to deactivate a client by their ID
exports.deactivateClientById = async (req, res) => {
  const clientId = parseInt(req.params.id);
  const { client_reason_inactive } = req.body;

  const response = await db.query(
    `UPDATE client 
    SET 
      client_inactive = $1,
      client_reason_inactive = $2
    WHERE client_id = $3`,
    [1, client_reason_inactive, clientId]
  );
  
  const response2 = await db.query(
    `UPDATE patient
    SET 
      patient_inactive = $1,
      patient_reason_inactive = $2
    WHERE patient_client_id = $3`,
    [1, client_reason_inactive, clientId]
  );
  res.status(200).send({ message: "Client and associated pets deactivated!" });
};

// query to reactivate a client by their ID
exports.reactivateClientById = async (req, res) => {
  const clientId = parseInt(req.params.id);

  const response = await db.query(
    `UPDATE patient
    SET 
      patient_inactive = $1,
      patient_reason_inactive = $2
    WHERE patient_client_id = $3 
    AND patient_reason_inactive = (
      SELECT client_reason_inactive 
      FROM client
      WHERE client_id = $4
    )`,
    [0, null, clientId, clientId]
  );

  const response2 = await db.query(
    `UPDATE client 
    SET 
      client_inactive = $1,
      client_reason_inactive = $2
    WHERE client_id = $3`,
    [0, null, clientId]
  );

  res.status(200).send({ message: "Client and associated pets reactivated!" });
};

exports.deleteClientById = async (req, res) => {
  const clientId = parseInt(req.params.id);
  await db.query('DELETE FROM client WHERE client_id = $1', 
    [clientId]);

  res.status(200).send({ message: 'Client deleted successfully!', clientId });
};