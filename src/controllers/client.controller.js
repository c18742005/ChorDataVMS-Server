/*
  File that handles DB access for clients
*/
const db = require("../config/database");
const { validationResult } = require('express-validator')
 
/*
  POST: /clients Create a client
  Request body:
    - (String) client_forename: Client first name
    -  (String) client_surname: Client last name
    -  (String) client_address: First line of address
    -  (String) client_city: City client lives in
    - (String) client_county: County client lives in
    -  (String) client_phone: Clients phone number
    -  (String) client_email: Client email address
    -  (Number) client_clinic_id: ID of clinic client will be associated with

  Returns: 
    201: Token and client details
    401: username/password combo does not exist
    422: Parameters do not pass validation
    500: Error on the server side
*/
exports.createClient = async (req, res) => {
  const errors = validationResult(req);

  // If errors exist during validation pass them to the user
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    // Destructure request body
    const { 
      client_forename, 
      client_surname, 
      client_address, 
      client_city, 
      client_county,
      client_phone,
      client_email,
      client_clinic_id  } = req.body;
  
    // Insert client into DB 
    await db.query(
      `INSERT INTO client(
        client_forename, 
        client_surname, 
        client_address, 
        client_city, 
        client_county, 
        client_phone, 
        client_email, 
        client_inactive,
        client_clinic_id ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        client_forename, 
        client_surname, 
        client_address, 
        client_city, 
        client_county, 
        client_phone, 
        client_email, 
        0,
        client_clinic_id]
    )
    .then(res => body = res.rows[0])
        
    // Send success response 
    res.status(201).send({
      message: "Client added successfully!",
      body
    });
  } catch (err) {
    // Send error response
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /clients/:id Retrieve client by their ID
  Request params:
    - (Number) id: Client ID

  Returns: 
    200: JSON client data
    500: Error on the server side
*/
exports.findClientById = async (req, res) => {
  try{
    const clientId = parseInt(req.params.id);

    const response = await db.query(
      'SELECT * FROM client WHERE client_id = $1',
      [clientId]);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /clients/clinic/:id Retrieve clients by a clinic ID
  Request params:
    - (Number) id: Clinic ID

  Returns: 
    200: JSON clients data
    500: Error on the server side
*/
exports.findClientsByClinicId = async (req, res) => {
  try{
    const clinic_id = parseInt(req.params.id);

    const response = await db.query('SELECT * FROM client WHERE client_clinic_id = $1',
      [clinic_id]);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /clients/:id Update a client by their ID
  Request params:
    - (Number) id: Client ID

  Returns: 
    200: JSON client data
    422: Parameters do not pass validation
    500: Error on the server side
*/
exports.updateClientById = async (req, res) => {
  const errors = validationResult(req);

  // Send errors in client validation
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    const clientId = parseInt(req.params.id);

    // Destructure req body
    const { 
      client_forename, 
      client_surname, 
      client_address, 
      client_city, 
      client_county,
      client_phone,
      client_email } = req.body;

    // Update the client DB record
    await db.query(
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
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /clients/deactivate/:id Deactivate a client by their ID
  Request params:
    - (Number) id: Client ID

  Request body:
    - (String) id: Reason to deactivate

  Returns: 
    200: Success message
    500: Error on the server side
*/
exports.deactivateClientById = async (req, res) => {
  try{
    const clientId = parseInt(req.params.id);
    const { client_reason_inactive } = req.body;

    // Update client inactive status and reason
    await db.query(
      `UPDATE client 
      SET 
        client_inactive = $1,
        client_reason_inactive = $2
      WHERE client_id = $3`,
      [1, client_reason_inactive, clientId]
    );
    
    // Update all clients pets to inactive with reason
    await db.query(
      `UPDATE patient
      SET 
        patient_inactive = $1,
        patient_reason_inactive = $2
      WHERE patient_client_id = $3`,
      [1, client_reason_inactive, clientId]
    );

    res.status(200).send({ message: "Client and associated pets deactivated!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /clients/reactivate/:id Reactivate a client by their ID
  Request params:
    - (Number) id: Client ID

  Returns: 
    200: Success message
    500: Error on the server side
*/
exports.reactivateClientById = async (req, res) => {
  try{
    const clientId = parseInt(req.params.id);

    // Update clients pets inactive status and reason
    // Only update pets that were deactivated for same reason as client
    await db.query(
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
  
    // Update clients inactive status and reason
    await db.query(
      `UPDATE client 
      SET 
        client_inactive = $1,
        client_reason_inactive = $2
      WHERE client_id = $3`,
      [0, null, clientId]
    );
  
    res.status(200).send({ message: "Client and associated pets reactivated!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  DELETE: /clients/:id Delete a client by their ID
  Request params:
    - (Number) id: Client ID

  Returns: 
    200: Success message on deletion
    500: Error on the server side
*/
exports.deleteClientById = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    await db.query('DELETE FROM client WHERE client_id = $1', 
      [clientId]);
  
    res.status(200).send({ message: 'Client deleted successfully!', clientId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};