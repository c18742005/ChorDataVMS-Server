/*
  File that handles DB access for patients
*/
const db = require("../config/database");
const { validationResult } = require('express-validator')

/*
  GET: /patients/:id Retrieve a patient by their ID
  Request params:
    - (Number) id: ID of patient

  Returns: 
    200: JSON patient data
    500: Error on the server side
*/
exports.findPatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);

    // Retrieve patient from DB
    const response = await db.query('SELECT * FROM patient WHERE patient_id = $1',
      [patientId]);

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
    500: Error on the server side
*/
exports.findPatientByClientId = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

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
    - (Number) clinic_id: ID of the clinic the patients belong to

  Returns: 
    200: JSON patients data
    404: Clinic does not exist
    500: Error on the server side
*/
exports.findPatientByClinicId = async (req, res) => {
  try{
    const clinic_id = parseInt(req.params.id);

    // Check if clinic exists
    const clinic = await db.query(
      "SELECT * FROM clinic WHERE clinic_id = $1", 
      [clinic_id]
    );

    // Send error as clinic does not exist
    if(clinic.rows.length === 0) {
      return res.status(404).json("Clinic with this ID does not exist");
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
      patient_name,
      patient_age,
      patient_species,
      patient_breed,
      patient_sex,
      patient_color,
      patient_microchip,
      patient_client_id } = req.body;
  
    // Insert patient into DB
    await db.query(
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
        patient_name,
        patient_age,
        patient_species,
        patient_breed,
        patient_sex,
        patient_color,
        patient_microchip,
        0,
        patient_client_id
      ]
    ).then(res => body = res.rows[0])
  
    res.status(201).send({
      message: "Patient added successfully!",
      body
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
    404: Patient does not exist
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
      patient_name,
      patient_age,
      patient_species,
      patient_breed,
      patient_sex,
      patient_color,
      patient_microchip } = req.body;

    // Check if patient exists
    const patient = await db.query(
      "SELECT * FROM patient WHERE patient_id = $1", 
      [patientId]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(404).json("Patient with this ID does not exist");
    }
  
    // Update the patient stored in the DB
    await db.query(
      `UPDATE patient
      SET 
        patient_name = $1,
        patient_age = $2,
        patient_species = $3,
        patient_breed = $4,
        patient_sex = $5,
        patient_color = $6,
        patient_microchip = $7
      WHERE patient_id = $8`,
      [
        patient_name,
        patient_age,
        patient_species,
        patient_breed,
        patient_sex,
        patient_color,
        patient_microchip, 
        patientId
      ]
    );

    res.status(200).send({ message: "Patient Updated Successfully!" });
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
    200: JSON success message
    404: Patient does not exist
    500: Error on the server side
*/
exports.deactivatePatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { patient_reason_inactive } = req.body;

    // Check if patient exists
    const patient = await db.query(
      "SELECT * FROM patient WHERE patient_id = $1", 
      [patientId]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(404).json("Patient with this ID does not exist");
    }
  
    // Deactivate the patient record
    await db.query(
      `UPDATE patient
      SET 
        patient_inactive = $1,
        patient_reason_inactive = $2
      WHERE patient_id = $3`,
      [1, patient_reason_inactive, patientId]
    );

    res.status(200).send({ message: "Patient Deactivated!" });
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
    200: JSON success message
    404: Patient does not exist
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
      return res.status(404).json("Patient with this ID does not exist");
    }

    await db.query(
      `UPDATE patient
      SET 
        patient_inactive = $1,
        patient_reason_inactive = $2
      WHERE patient_id = $3`,
      [0, null, patientId]
    );

    res.status(200).send({ message: "Patient Reactivated!" });
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
    200: JSON success message
    404: Patient does not exist
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
      return res.status(404).json("Patient with this ID does not exist");
    }

    // Delete patient record from the DB
    await db.query('DELETE FROM patient WHERE patient_id = $1', 
      [patientId]);
  
    res.status(200).send({ message: 'Patient deleted successfully!', patientId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  } 
};
