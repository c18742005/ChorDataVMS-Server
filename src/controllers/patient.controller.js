/*
  File that handles DB access for patients
*/
const db = require("../config/database");
const { validationResult } = require('express-validator'); 

/*
  GET: /patients/:id Retrieve a patient by their ID
  Request params:
    - (Number) id: ID of patient

  Returns: 
    200: JSON patient data
    400: No patient with ID supplied
    500: Error on the server side
*/
exports.findPatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);

    // Retrieve patient from DB
    const response = await db.query('SELECT * FROM patient WHERE patient_id = $1',
      [patientId]);

    if(response.rows.length === 0) {
      return res.status(400).json("No patient found with ID supplied");
    }

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};

/*
  GET: /patients/client/:id Retrieve all patients owned by a client using the client ID
  Request params:
    - (Number) client_id: ID of the client

  Returns: 
    200: JSON patients data
    400: Client does not exist
    500: Error on the server side
*/
exports.findPatientByClientId = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    // Check client exists 
    const client = await db.query('SELECT * FROM client WHERE client_id = $1',
      [clientId]
    );

    if(client.rows.length === 0) {
      return res.status(400).json("No client found with ID supplied");
    }
  
    // Retrieve patient data
    const response = await db.query('SELECT * FROM patient WHERE patient_client_id = $1',
      [clientId]
    );

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};

/*
  GET: /patients/clinic/:id Retrieve all patients treated in a clinic by the clinic ID
  Request params:
    - (String) clinic_id: ID of the clinic the patients belong to

  Returns: 
    200: JSON patients data
    400: Clinic does not exist
    500: Error on the server side
*/
exports.findPatientByClinicId = async (req, res) => {
  try{
    const clinic_id = req.params.id;

    // Check if clinic exists
    const clinic = await db.query(
      "SELECT * FROM clinic WHERE clinic_id = $1", 
      [clinic_id]
    );

    // Send error as clinic does not exist
    if(clinic.rows.length === 0) {
      return res.status(400).json("No clinic found with ID supplied");
    }

    // Retrieve patient records from DB
    const response = await db.query(
      `SELECT * FROM patient 
      WHERE patient_client_id IN (
        SELECT client_id FROM client
        WHERE client_clinic_id = $1
      )`,
      [clinic_id]
    );

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /patients/species/:species/clinic/:clinic_id
    Retrieve all patients of a particular species treated in a clinic by the clinic ID
  Request params:
    - (String) clinic_id: ID of the clinic the patients belong to
    - (String) species: The species they wish to retrieve

  Returns: 
    200: JSON patients data
    400: Clinic does not exist or species is not recognised 
    500: Error on the server side
*/
exports.findSpeciesByClinicId = async (req, res) => {
  try{
    const clinic_id = req.params.id;
    const species = req.params.species;

    const recognised_species = [
      "Avian",
      "Canine",
      "Feline",
      "Reptile",
      "Rodent"
    ]

    // Check if clinic exists
    const clinic = await db.query(
      "SELECT * FROM clinic WHERE clinic_id = $1", 
      [clinic_id]
    );

    // Send error as clinic does not exist
    if(clinic.rows.length === 0) {
      return res.status(400).json("No clinic found with ID supplied");
    }

    // Check if species is a recognised species
    if(!recognised_species.includes(species)) {
      return res.status(400).json("No species found of this type");
    }

    // Retrieve species records from DB
    const response = await db.query(
      `SELECT patient_id, patient_name, patient_microchip, patient_species
      FROM patient 
      WHERE patient_client_id IN (
        SELECT client_id FROM client
        WHERE client_clinic_id = $1
      )
      AND patient_species = $2`,
      [clinic_id, species]
    );

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /patients Add patient to a clinic
  Request body:
    - (String) patient_name: Name of patient
    - (Number) patient_age: Age of patient
    - (String) patient_species: Species of patient i.e. Canine, Avian
    - (String) patient_breed: Breed of species i.e. Collie, Canary
    - (String) patient_sex: Sex of patient i.e. M (male), FN (Female Neutered)
    - (String) patient_color: Color of patients fur, skin, etc
    - (Number) patient_microchip: Patient microchip number
    - (Number) patient_client_id: ID of client patient is owned by

  Returns: 
    201: JSON patient data
    400: No client with ID specified, species or sex is invalid
    409: Microchip already belongs to another patient
    422: JSON errors in validating the patient data
    500: Error on the server side
*/
exports.createPatient = async (req, res) => {
  const errors = validationResult(req);

  // Send validation errors to client
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  } 

  try {
    // Destructure patient req body
    const { 
      patient_species,
      patient_sex,
      patient_microchip,
      patient_client_id } = req.body;

    // Check if microchip is already in DB
    const patient = await db.query(
      "SELECT patient_microchip FROM patient WHERE patient_microchip = $1", 
      [patient_microchip]
    );

    // Send error res as microchip is taken
    if(patient.rows.length !== 0) {
      return res.status(409).json("Microchip already belongs to another patient");
    }

    // Check if client exists
    const client = await db.query(
      "SELECT client FROM client WHERE client_id = $1", 
      [patient_client_id]
    );

    // Send error as client does not exist
    if(client.rows.length === 0) {
      return res.status(400).json("No such client with ID supplied");
    }

    // Check if patient sex is correct
    const allowed_sexes = ["M", "MN", "F", "FN"];

    if(!allowed_sexes.includes(patient_sex)) {
      return res.status(400).json("Sex supplied is not valid");
    }

    // Check patient species is correct
    const recognised_species = [
      "Avian",
      "Canine",
      "Feline",
      "Reptile",
      "Rodent"
    ]

    if(!recognised_species.includes(patient_species)) {
      return res.status(400).json("Species supplied is not valid");
    }

    // insert patient into DB
    const response = await this.insertPatient(req.body);

    if(response === 500) {
      return res.status(500).json("Server error adding patient. Please try again")
    }
  
    res.status(201).send({
      message: "Patient added successfully",
      body: response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /patients/:id Update a patient by their ID
  Request params:
    - (Number) id: Patient ID

  Request body:
    - (String) patient_name: Name of patient
    - (Number) patient_age: Age of patient
    - (String) patient_species: Species of patient i.e. Canine, Avian
    - (String) patient_breed: Breed of species i.e. Collie, Canary
    - (String) patient_sex: Sex of patient i.e. M (male), FN (Female Neutered)
    - (String) patient_color: Color of patients fur, skin, etc
    - (Number) patient_microchip: Patient microchip number

  Returns: 
    200: JSON drug stock data
    400: Patient does not exist, species or sex does not exist
    409: Microchip already owned by another patient
    422: JSON errors in validating the patient data
    500: Error on the server side
*/
exports.updatePatientById = async (req, res) => {
  const errors = validationResult(req);

  // Return patient validation errors to client
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try {
    const patientId = parseInt(req.params.id);

    // Destructure req body
    const { 
      patient_species,
      patient_sex,
      patient_microchip } = req.body;

    // Check if patient exists
    const patient = await db.query(
      "SELECT * FROM patient WHERE patient_id = $1", 
      [patientId]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(400).json("Patient with ID supplied does not exist");
    }

    // Check if microchip exists
    const microchip = await db.query(
      `SELECT patient_microchip FROM patient 
      WHERE patient_microchip = $1
      AND patient_id <> $2`, 
      [patient_microchip, patientId]
    );

    // Send error as microchip is taken
    if(microchip.rows.length > 0) {
      return res.status(409).json("Microchip already belongs to another patient");
    }

    // Check if patient sex is correct
    const allowed_sexes = ["M", "MN", "F", "FN"];

    if(!allowed_sexes.includes(patient_sex)) {
      return res.status(400).json("Sex supplied is not valid");
    }

    // Check patient species is correct
    const recognised_species = [
      "Avian",
      "Canine",
      "Feline",
      "Reptile",
      "Rodent"
    ]

    // Check species is recognised, if not give error
    if(!recognised_species.includes(patient_species)) {
      return res.status(400).json("Species supplied is not valid");
    }

    // Update the patient stored in the DB
    const response = await this.updatePatient(patientId, req.body)

    // If response was 500 then there was a server error updating the patient
    if(response === 500) {
      return res.status(500).json("Server error updating patient. Please try again")
    }

    res.status(201).send({ message: "Patient updated Successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};

/*
  PUT: /patients/deactivate/:id Deactivate a patient by their ID
  Request params:
    - (Number) id: Patient ID

  Request body:
    - (String) patient_reason_inactive: Reason why patient is getting deactivated

  Returns: 
    201: JSON success message
    400: Patient does not exist
    422: Error validating reason for deactivating
    500: Error on the server side
*/
exports.deactivatePatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { patient_reason_inactive } = req.body;

    // Check reason is present
    if(!patient_reason_inactive) {
      return res.status(422).json("Please supply a valid reason for deactivating account");
    }

    const inactive_reasons = [
      "Other",
      "Patient Deceased",
      "Patient Rehomed",
      "Client Relocating"
    ]

    // Check reason for deactivating is valid
    if(!inactive_reasons.includes(patient_reason_inactive)) {
      return res.status(400).json("Reason for deactivating is not valid. Please use a valid reason")
    }

    // Check if patient exists
    const patient = await db.query(
      "SELECT * FROM patient WHERE patient_id = $1", 
      [patientId]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(400).json("Patient with ID supplied does not exist");
    }
  
    // Deactivate the patient record
    const response = await this.deactivatePatient(patientId, patient_reason_inactive);
    
    // Send error as DB was not updated
    if(response === 500) {
      return res.status(500).json("Server error deactivating patient. Please try again");
    }

    res.status(201).send({ message: "Patient Deactivated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};

/*
  PUT: /patients/reactivate/:id Reactivate a patient by their ID
  Request params:
    - (Number) id: Patient ID

  Returns: 
    201: JSON success message
    400: Patient does not exist or patient is active
    500: Error on the server side
*/
exports.reactivatePatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);

    // Check if patient exists
    const patient = await db.query(
      "SELECT * FROM patient WHERE patient_id = $1", 
      [patientId]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(400).json("Patient with ID supplied does not exist");
    }

    // Send error as patient is already active
    if(patient.rows[0].patient_inactive === false) {
      return res.status(400).json("Patient is already active");
    }

    // reactivate patient in DB
    const response = this.reactivatePatient(patientId);

    if(response === 500) {
      return res.status(500).status("Server error reactivating patient. Please try again");
    }

    res.status(201).send({ message: "Patient Reactivated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};

/*
  DELETE: /patients/:id Delete a patient by their ID
  Request params:
    - (Number) id: Patient ID

  Returns: 
    201: JSON success message
    400: Patient does not exist
    500: Error on the server side
*/
exports.deletePatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);

    // Check if patient exists
    const patient = await db.query(
      "SELECT * FROM patient WHERE patient_id = $1", 
      [patientId]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(400).json("Patient with ID supplied does not exist");
    }

    // Delete patient record from the DB
    const response = await this.deletePatient(patientId);

    if(response === 500) {
      return res.status(500).json("Server error deleting patient. Please try again")
    }
  
    res.status(201).send({ message: 'Patient deleted successfully', patientId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};

/*
  Insert patient into the database
  Request params:
    - (Object) patient: patient details

  Returns: 
    (Success) Object: Patient details
    (Error) Integer: 500
*/
exports.insertPatient = async (patient) => {
  try {
    // Insert patient into DB
    const response = await db.query(
      `INSERT INTO patient(
        patient_name,
        patient_age,
        patient_species,
        patient_breed,
        patient_sex,
        patient_color,
        patient_microchip,
        patient_inactive,
        patient_client_id ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        patient.patient_name,
        patient.patient_age,
        patient.patient_species,
        patient.patient_breed,
        patient.patient_sex,
        patient.patient_color,
        patient.patient_microchip,
        0,
        patient.patient_client_id
    ]);

    if(response.rows.length === 0) {
      return 500;
    }

    return response.rows[0];
  } catch (err) {
    console.error(err);
    return 500;
  }
}

/*
  Update patient in the database
  Request params:
    - (Object) patient: patient details

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.updatePatient = async (patient_id, patient) => {
  try {
    // Update the patient stored in the DB
    const response = await db.query(
      `UPDATE patient
      SET 
        patient_name = $1,
        patient_age = $2,
        patient_species = $3,
        patient_breed = $4,
        patient_sex = $5,
        patient_color = $6,
        patient_microchip = $7
      WHERE patient_id = $8
      RETURNING *`,
      [
        patient.patient_name,
        patient.patient_age,
        patient.patient_species,
        patient.patient_breed,
        patient.patient_sex,
        patient.patient_color,
        patient.patient_microchip, 
        patient_id
      ]
    );

    if(response.rows.length === 0) {
      return 500;
    }

    return 201
  } catch (err) {
    console.error(err);
    return 500;
  }
}

/*
  Update patient in the database to be inactive
  Request params:
    - (Integer) patient_id: patient to deactivate
    - (String) reason: Reason to deactivate account

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.deactivatePatient = async (patient_id, reason) => {
  try {
    // Deactivate the patient in the DB
    const response = await db.query(
      `UPDATE patient
      SET 
        patient_inactive = $1,
        patient_reason_inactive = $2
      WHERE patient_id = $3
      RETURNING *`,
      [1, reason, patient_id]
    );

    if(response.rows.length === 0) {
      return 500;
    }

    return 201;
  } catch (err) {
    console.error(err);
    return 500;
  }
}

/*
  Update patient in the database to be active
  Request params:
    - (Integer) patient_id: patient to deactivate

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.reactivatePatient = async (patient_id) => {
  try {
    // Reactivate the patient in the DB
    const response = await db.query(
      `UPDATE patient
      SET 
        patient_inactive = $1,
        patient_reason_inactive = $2
      WHERE patient_id = $3`,
      [0, null, patient_id]
    );

    if(response.rows.length === 0) {
      return 500;
    }

    return 201;
  } catch (err) {
    console.error(err);
    return 500;
  }
}

/*
  Delete patient in the database
  Request params:
    - (Integer) patient_id: patient to delete

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.deletePatient = async (patient_id) => {
  try {
    // Delete patient from DB
    const response = await db.query(`
      DELETE FROM patient 
      WHERE patient_id = $1
      RETURNING *`, 
      [patient_id]
    );

    if(response.rows.length === 0) {
      return 500;
    }

    return 201;
  } catch (err) {
    console.error(err);
    return 500;
  }
}