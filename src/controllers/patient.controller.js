const db = require("../config/database");

// query to add a patient
exports.createPatient = async (req, res) => {
  let body = {};
  const { 
    patient_name,
    patient_age,
    patient_species,
    patient_breed,
    patient_sex,
    patient_color,
    patient_microchip,
    patient_client_id } = req.body;

  const rows = await db.query(
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
};

// query to list all patients
exports.listAllPatients = async (req, res) => {
  const response = await db.query('SELECT * FROM patient ORDER BY patient_name ASC');
  res.status(200).send(response.rows);
};

// query to get a patient by their ID
exports.findPatientById = async (req, res) => {
  const patientId = parseInt(req.params.id);
  const response = await db.query('SELECT * FROM patient WHERE patient_id = $1',
    [patientId]);
  res.status(200).send(response.rows);
};

// query to get a patient by their ID
exports.findPatientByClientId = async (req, res) => {
  const clientId = parseInt(req.params.id);
  const response = await db.query('SELECT * FROM patient WHERE patient_client_id = $1',
    [clientId]);
  res.status(200).send(response.rows);
};

// query to update a patient by their ID
exports.updatePatientById = async (req, res) => {
  const patientId = parseInt(req.params.id);
  const { 
    patient_name,
    patient_age,
    patient_species,
    patient_breed,
    patient_sex,
    patient_color,
    patient_microchip } = req.body;

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
};

// query to deactivate a patient by their ID
exports.deactivatePatientById = async (req, res) => {
  const patientId = parseInt(req.params.id);
  const { patient_reason_inactive } = req.body;

  const response = await db.query(
    `UPDATE patient
    SET 
      patient_inactive = $1,
      patient_reason_inactive = $2
    WHERE patient_id = $3`,
    [1, patient_reason_inactive, patientId]
  );
  res.status(200).send({ message: "Patient Deactivated!" });
};

// query to deactivate a patient by their ID
exports.reactivatePatientById = async (req, res) => {
  const patientId = parseInt(req.params.id);

  const response = await db.query(
    `UPDATE patient
    SET 
      patient_inactive = $1,
      patient_reason_inactive = $2
    WHERE patient_id = $3`,
    [0, null, patientId]
  );
  res.status(200).send({ message: "Patient Reactivated!" });
};

exports.deletePatientById = async (req, res) => {
  const patientId = parseInt(req.params.id);
  await db.query('DELETE FROM patient WHERE patient_id = $1', 
    [patientId]);

  res.status(200).send({ message: 'Patient deleted successfully!', patientId });
};