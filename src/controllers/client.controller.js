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
    -  (String) client_clinic_id: ID of clinic client will be associated with

  Returns: 
    201: Token and client details
    403: Invalid JWT
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
    const body = await this.insertClient(req.body);
        
    // Send success response 
    res.status(201).send({
      message: "Client added successfully",
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
    401: No client available with this ID
    500: Error on the server side
*/
exports.findClientById = async (req, res) => {
  try{
    const clientId = parseInt(req.params.id);
    const client = await this.getClient(clientId)

    if(client === 400) {
      return res.status(400).json("No client with this ID");
    }

    res.status(200).send(client);
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
    const clinic_id = req.params.id;

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

    if(clientId <= 0 ) {
      return res.status(400).json({ message: "Unable to update client" });
    }

    const updated = this.updateClient(req.body, clientId);

    if(updated === 400) {
      return res.status(400).json({ message: "Unable to update client" });
    }

    res.status(201).send({ message: "Client updated successfully" });
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
    
    if(!client_reason_inactive) {
      return res.status(400).send({ message: "Reason to deactivate must be given" });
    }

    if(clientId <= 0) {
      return res.status(400).send({ message: "Client ID is not valid" });
    }

    const deactivatedClient = this.setClientInactive(clientId, client_reason_inactive)

    if(deactivatedClient === 400) {
      return res.status(400).send({ message: "Client deactivation failed" });
    }

    const deactivatedPatients = this.setPatientsInactive(clientId, client_reason_inactive)

    if(deactivatedPatients === 400) {
      return res.status(400).send({ message: "Client deactivation failed" });
    }

    res.status(201).send({ message: "Client and associated pets deactivated" });
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

    if(clientId <= 0) {
      return res.status(400).send({ message: "Client not found" });
    }

    const patientsActive = await this.setPatientsActive(clientId);
    if(patientsActive === 400) {
      return res.status(400).send({ message: "Client and associated pets were not reactivated" });
    }

    const clientActive = await this.setClientActive(clientId);
    if(clientActive === 400) {
      return res.status(400).send({ message: "Client and associated pets were not reactivated" });
    }
  
    res.status(201).send({ message: "Client and associated pets reactivated" });
  } catch (err) {
    console.error(err);
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
  
    res.status(200).send({ message: 'Client deleted successfully', clientId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  Insert New Client Into DB

  Returns:
    (Success) Object: client object created
    (Error) Integer: 0
*/
exports.insertClient = async (client_data) => {
  try {
    // Insert client into DB 
    const client = await db.query(
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
        client_data.client_forename, 
        client_data.client_surname, 
        client_data.client_address, 
        client_data.client_city, 
        client_data.client_county, 
        client_data.client_phone, 
        client_data.client_email, 
        0,
        client_data.client_clinic_id
      ])

    return client.rows[0];
  } catch (err) {
    console.error(err.message);
    return 0;
  }
}

/*
  Retrieve client from DB

  Returns:
    (Success) Object: client object
    (Error) Integer: 400
*/
exports.getClient = async (client_id) => {
  try {
    // Retrieve client from DB 
    const clients = await db.query(
      'SELECT * FROM client WHERE client_id = $1',
      [client_id]);

    if(clients.rows.length === 0) {
      return 400;
    }

    return clients.rows[0];
  } catch (err) {
    console.error(err.message);
    return 400;
  }
}

/*
  Update client in DB

  Returns:
    (Success) Integer: 200
    (Error) Integer: 400
*/
exports.updateClient = async (client, client_id) => {
  try {
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
        client.client_forename, 
        client.client_surname, 
        client.client_address, 
        client.client_city, 
        client.client_county, 
        client.client_phone, 
        client.client_email, 
        client_id
      ]
    );

    return 200;
  } catch (err) {
    console.error(err.message);
    return 400;
  }
}

/*
  Set client active in DB

  Returns:
    (Success) Integer: 200
    (Error) Integer: 400
*/
exports.setClientActive = async (client_id) => {
  try {
    // Update clients inactive status and reason
    await db.query(
      `UPDATE client 
      SET 
        client_inactive = $1,
        client_reason_inactive = $2
      WHERE client_id = $3`,
      [0, null, client_id]
    );

    return 200;
  } catch (err) {
    console.error(err.message);
    return 400;
  }
}

/*
  Set client inactive in DB

  Returns:
    (Success) Integer: 200
    (Error) Integer: 400
*/
exports.setClientInactive = async (client_id, reason) => {
  try {
    // Update client inactive status and reason
    await db.query(
      `UPDATE client 
      SET 
        client_inactive = $1,
        client_reason_inactive = $2
      WHERE client_id = $3`,
      [1, reason, client_id]
    );

    return 200;
  } catch (err) {
    console.error(err.message);
    return 400;
  }
}

/*
  Set patient as active in DB

  Returns:
    (Success) Integer: 200
    (Error) Integer: 400
*/
exports.setPatientsActive = async (client_id) => {
  try {
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
      [0, null, client_id, client_id]
    );

    return 200;
  } catch (err) {
    console.error(err.message);
    return 400;
  }
}

/*
  Set patients inactive in DB

  Returns:
    (Success) Integer: 200
    (Error) Integer: 400
*/
exports.setPatientsInactive = async (client_id, reason) => {
  try {
    // Update all clients pets to inactive with reason
    await db.query(
      `UPDATE patient
      SET 
        patient_inactive = $1,
        patient_reason_inactive = $2
      WHERE patient_client_id = $3`,
      [1, reason, client_id]
    );

    return 200;
  } catch (err) {
    console.error(err.message);
    return 400;
  }
}