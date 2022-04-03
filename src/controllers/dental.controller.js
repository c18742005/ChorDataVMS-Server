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
    400: Incorrect patient ID 
    500: Error on the server side
*/
exports.findDentalByPatientId = async (req, res) => {
  try{
    const patient_id = parseInt(req.params.id);

    // Check patient exists
    const patient = await db.query(
      `SELECT patient_id FROM patient
      WHERE patient_id = $1`,
      [patient_id]
    );

    if(patient.rows.length === 0) {
      return res.status(400).json("No patient found with ID supplied")
    }

    // Retrieve dental
    const response = await db.query(
      `SELECT * FROM tooth 
      WHERE tooth_patient_id = $1
      ORDER BY tooth_id ASC`,
      [patient_id]);

    // if response returns nothing then there was an error
    if(response.rowCount.length === 0) {
      return res.status(500).json("Server error retrieving dental. Please try again")
    }

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
    201: JSON dental data
    400: Patient does not exist
    403: Patient is inactive or species cannot have a dental
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

    // Check if patient exists and is deactivated
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [patient_id]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(400).json("Patient with supplied ID does not exist");
    }

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
      return res.status(403).json(`Dental not available for ${species.rows[0].patient_species}`);
    }

    // Add dental data to DB
    // Loop through each section of teeth
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

      // Loop through a section of teeth and add them to DB
      for(tooth_id; tooth_id <= pos; tooth_id++) {
        const response = await this.insertTooth(tooth_id, patient_id);

        if(response === 500) {
          return res.status(500).json("Server error creating dental. Please try again");
        }
      }
    }

    const insertDental = this.insertDental(patient_id);

    if(insertDental === 500) {
      return res.status(500).json("Error adding dental to DB. Please try again");
    }

    // Retrieve dental from DB
    const response = await db.query(
      `SELECT * FROM tooth
      WHERE tooth_patient_id = $1`,
      [patient_id]
    )

    if(response.rows.length === 0) {
      return res.status(500).json("Error retrieving dental from server. Please try again");
    }

    res.status(201).send({
      message: "Dental added successfully",
      body: response.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /dentals/tooth Update a tooth
  Request body:
    - (Object) tooth: JSON obj that holds tooth data 

  Returns: 
    201: JSON new tooth data
    400: Patient does not exist
    403: Patient is inactive
    500: Error on the server side
*/
exports.updateToothByToothIdAndPatientId = async (req, res) => {
  const errors = validationResult(req);

  // If errors exist during validation pass them to the user
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  
  try{
    const tooth_id = parseInt(req.params.tooth_id);
    const patient_id = parseInt(req.params.patient_id);
    const { tooth_note, tooth_problem } = req.body;

    // Check if patient is deactivated or does not exist
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [patient_id]
    );

    // If patient does not exist send error
    if(patient.rows.length === 0) {
      return res.status(400).json(`Patient does not exist`);
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
      return res.status(400).json(`Tooth does not exist`);
    }

    // Update the tooth in the DB
    const response = await this.updateTooth(
      tooth_id, 
      patient_id, 
      tooth_problem, 
      tooth_note
    );

    // Send error as tooth was not updated
    if(response === 500) {
      return res.status(500).json("Server error updating tooth. Please try again");
    }
  
    res.status(201).send({ 
      message: "Tooth updated successfully",
      body: response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};

/*
  Insert a tooth into the DB
    - (Integer) tooth_id: ID of the tooth to enter
    - (Integer) patient_id: ID of the patient the tooth will belong to

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.insertTooth = async (tooth_id, patient_id) => {
  try {
    const response = await db.query(
      `INSERT INTO tooth(
        tooth_id,
        tooth_patient_id,
        tooth_problem,
        tooth_note
      )
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,[
        tooth_id, 
        patient_id, 
        "Healthy", 
        null ]);
    
    if(response.rows.length === 0) {
      return 500;
    }
    
    return 201;
  } catch(err) {
    console.error(err);
    return 500
  }
}

/*
  Update a tooth in the DB
    - (Integer) tooth_id: ID of the tooth to enter
    - (Integer) patient_id: ID of the patient the tooth will belong to
    - (String) problem: The problem with the tooth
    - (String) notes: Any notes on the tooth

  Returns: 
    (Success) Object: The updated tooth object
    (Error) Integer: 500
*/
exports.updateTooth = async (tooth_id, patient_id, problem, notes) => {
  try {
    // update the tooth values 
    const response = await db.query(
      `UPDATE tooth
      SET tooth_problem = $1,
      tooth_note = $2
      WHERE tooth_id = $3 AND tooth_patient_id = $4
      RETURNING *`,
      [
        problem, 
        notes,
        tooth_id,
        patient_id
    ]);
    
    // Return error as update failed
    if(response.rows.length === 0) {
      return 500;
    }

    const updateDental = this.updateDental(patient_id);

    if(updateDental === 500) {
      return 500;
    }
    
    return response.rows[0];
  } catch(err) {
    console.error(err);
    return 500
  }
}

/*
  Insert a dental into the DB
    - (Integer) patient_id: ID of the patient the dental will belong to

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.insertDental = async (patient_id) => {
  try {
    // Get current date
    const date_obj = new Date();
    const date = ("0" + date_obj.getDate()).slice(-2);
    const month = ("0" + (date_obj.getMonth() + 1)).slice(-2);
    const year = date_obj.getFullYear();
    const date_string = `${year}-${month}-${date}`;

    // insert the tooth values 
    const response = await db.query(
      `INSERT INTO dental(
        dental_patient_id,
        dental_date_updated
      )
      VALUES ($1, $2) 
      RETURNING *`,[
        patient_id, 
        date_string
      ]);
    
    // Return error as insert failed
    if(response.rows.length === 0) {
      return 500;
    }
    
    return 201;
  } catch(err) {
    console.error(err);
    return 500
  }
}

/*
  Update a dental in the DB
    - (Integer) patient_id: ID of the patient the dental belongs to

  Returns: 
    (Success) Integer: 201
    (Error) Integer: 500
*/
exports.updateDental = async (patient_id) => {
  try {
    // Get current date
    const date_obj = new Date();
    const date = ("0" + date_obj.getDate()).slice(-2);
    const month = ("0" + (date_obj.getMonth() + 1)).slice(-2);
    const year = date_obj.getFullYear();
    const date_string = `${year}-${month}-${date}`;

    // insert the tooth values 
    const response = await db.query(
      `UPDATE dental
      SET dental_date_updated = $1
      WHERE dental_patient_id = $2
      RETURNING *`, [
        date_string,
        patient_id
      ]);
    
    // Return error as update failed
    if(response.rows.length === 0) {
      return 500;
    }
    
    return 201;
  } catch(err) {
    console.error(err);
    return 500
  }
}