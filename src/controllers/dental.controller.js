/*
  File that handles DB access for dentals
*/
const db = require("../config/database");
const { validationResult } = require('express-validator')

/*
  GET: /dentals/:id Retrieve a dental by the patient ID
  Request params:
    - (Number) id: patient ID

  Returns: 
    200: JSON dental data
    500: Error on the server side
*/
exports.findDentalByPatientId = async (req, res) => {
  try{
    const patient_id = parseInt(req.params.id);

    const response = await db.query(
      `SELECT * FROM tooth 
      WHERE tooth_patient_id = $1
      ORDER BY tooth_id ASC`,
      [patient_id]);

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /dentals/:id Add a patient dental by the patients ID
  Request params:
    - (Number) id: Patient ID to add a dental for

  Returns: 
    200: JSON dental data
    409: Dental already exists or patient inactive
    500: Error on the server side
*/
exports.addDental = async (req, res) => {
  try{
    // Set variables for teeth
    let top_right_end = 0;
    let top_left_end = 0;
    let bottom_right_end = 0;
    let bottom_left_end = 0;

    const patient_id = parseInt(req.params.id);

    // Check if patient already has dental file
    const dental = await db.query(
      "SELECT * FROM tooth WHERE tooth_patient_id = $1", 
      [patient_id]
    );

    // throw error as dental already exists
    if(dental.rows.length !== 0) {
      return res.status(409).json("Dental for this patient is already available");
    }

    // Check if patient is deactivated
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [patient_id]
    );

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      const patient_name = patient.rows[0].patient_name
      return res.status(403).json(
        `Patient (${patient_name}) is inactive. 
        Please reactivate ${patient_name} before adding a dental record`
      );
    }

    // Check patient species
    const species = await db.query(
      "SELECT patient_species FROM patient WHERE patient_id = $1", 
      [patient_id]
    );

    // Add canine or feline dental, or refuse dental
    if(species.rows[0].patient_species === "Canine") {
      top_right_end = 110;
      top_left_end = 210;
      bottom_right_end = 411;
      bottom_left_end = 311;
    } else if(species.rows[0].patient_species === "Feline") {
      top_right_end = 108;
      top_left_end = 208;
      bottom_right_end = 407;
      bottom_left_end = 307;
    } else {
      return res.status(409).json(`Dental not available for ${species.rows[0].patient_species}`);
    }

    // Add dental data to DB
    for(let i = 0; i < 4; i++) {
      let tooth_id;
      let pos;
      switch(i) {
        case 0:
          tooth_id = 101;
          pos = top_right_end;
          break;
        case 1:
          tooth_id = 201;
          pos = top_left_end;
          break;
        case 2:
          tooth_id = 301;
          pos = bottom_left_end;
          break;
        case 3:
          tooth_id = 401;
          pos = bottom_right_end;
          break;
        default:
          tooth_id = 0;
          pos = 0;
      }

      for(tooth_id; tooth_id <= pos; tooth_id++) {
        await db.query(
          `INSERT INTO tooth(
            tooth_id,
            tooth_patient_id,
            tooth_problem,
            tooth_note
          )
          VALUES ($1, $2, $3, $4) 
          RETURNING *`,
          [
            tooth_id, 
            patient_id, 
            "Healthy", 
            null
          ]);
      }
    }

    await db.query(
      `SELECT * FROM tooth
      WHERE tooth_patient_id = $1`,
      [
        patient_id
      ]).then(res => body = res.rows)

    res.status(201).send({
      message: "Dental added successfully!",
      body
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /dentals/update/:id Update a dental 
  Request params:
    - (Number) id: ID of the patient that the dental log must be updated for
  Request body:
    - (Arr) teeth: JSON array that holds all tooth data in objects

  Returns: 
    200: JSON dental data
    403: Patient is inactive
    500: Error on the server side
*/
exports.updateDental = async (req, res) => {
  try{
    const patient_id = parseInt(req.params.id);
    const teeth = req.body.teeth;

    // Check if patient has dental
    const dental = await db.query(
      "SELECT tooth_id FROM tooth WHERE tooth_patient_id = $1", 
      [patient_id]
    );

    // Send error as patient does not have dental to update
    if(dental.rows.length === 0) {
      return res.status(403).json(
        `Patient does not have a dental record. 
        Please add a dental before updating the dental record.`
      );
    }

    // Check if patient is deactivated
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [patient_id]
    );

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      const patient_name = patient.rows[0].patient_name
      return res.status(403).json(
        `Patient (${patient_name}) is inactive. 
        Please reactivate ${patient_name} before updating dental record`
      );
    }

    // Loop through each tooth and update the values 
    await teeth.forEach(tooth => {
      db.query(
        `UPDATE tooth
        SET tooth_problem = $1,
        tooth_note = $2
        WHERE tooth_id = $3 AND tooth_patient_id = $4`,
        [
          tooth.tooth_problem, 
          tooth.tooth_note,
          tooth.tooth_id,
          patient_id
        ])
    });

    // Retrieve all updated values
    await db.query(
      `SELECT * FROM tooth
      WHERE tooth_patient_id = $1
      ORDER BY tooth_id ASC`,
      [patient_id])
      .then(res => {
        body = res.rows
      })
  
    res.status(200).send({ 
      message: "Dental updated successfully!",
      body
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /dentals/tooth Update a tooth
  Request body:
    - (Object) teeth: JSON obj that holds all tooth data 

  Returns: 
    200: JSON new tooth data
    403: Patient is inactive
    500: Error on the server side
*/
exports.updateTooth = async (req, res) => {
  const errors = validationResult(req);

  // If errors exist during validation pass them to the user
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  
  try{
    const tooth_id = parseInt(req.params.tooth_id);
    const patient_id = parseInt(req.params.patient_id);
    const tooth_note = req.body.tooth_note;
    const tooth_problem = req.body.tooth_problem;

    // Check if patient is deactivated or does not exist
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [patient_id]
    );

    // If patient does not exist send error
    if(patient.rows.length === 0) {
      return res.status(403).json(`Patient does not exist`);
    }

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      const patient_name = patient.rows[0].patient_name
      return res.status(403).json(
        `Patient (${patient_name}) is inactive. 
        Please reactivate ${patient_name} before updating dental record`
      );
    }

    // Check if tooth exists
    const tooth = await db.query(
      `SELECT tooth_id FROM tooth 
      WHERE tooth_id = $1
      AND tooth_patient_id = $2`, 
      [tooth_id, patient_id]
    );

    // If tooth does not exist send error
    if(tooth.rows.length === 0) {
      return res.status(403).json(`Tooth does not exist`);
    }

    // update the tooth values 
    await db.query(
      `UPDATE tooth
      SET tooth_problem = $1,
      tooth_note = $2
      WHERE tooth_id = $3 AND tooth_patient_id = $4
      RETURNING *`,
      [
        tooth_problem, 
        tooth_note,
        tooth_id,
        patient_id
    ]).then(res => {
      body = res.rows[0];
    })
  
    res.status(200).send({ 
      message: "Tooth updated successfully!",
      body
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};