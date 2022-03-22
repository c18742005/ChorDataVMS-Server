/*
  File that handles DB access for cremations
*/
const db = require("../config/database");
const { validationResult } = require('express-validator')
 
/*
  GET: /cremations/clinic/:id Retrieve all cremations for a clinic by their clinic ID
  Request params:
    - (Number) id: Clinic ID

  Returns: 
    200: JSON cremation data
    500: Error on the server side
*/
exports.findCremationsByClinicId = async (req, res) => {
  try{
    const clinicId = parseInt(req.params.id);

    const response = await db.query(
      `SELECT 
        c.cremation_id,
        c.cremation_date_collected, 
        c.cremation_date_ashes_returned_practice, 
        c.cremation_date_ashes_returned_owner, 
        c.cremation_form, 
        c.cremation_owner_contacted, 
        c.cremation_patient_id,
        p.patient_name, 
        p.patient_microchip
      FROM cremation c
      INNER JOIN patient p ON 
        c.cremation_patient_id = p.patient_id
      WHERE cremation_clinic_id = $1;`,
      [clinicId]);

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /cremations Add a cremation to the table
  Request body:
    - (String) cremation_date_collected: Date remains were collected
    - (String) cremation_date_ashes_returned_practice: Date ashes returned to practice
    - (String) cremation_date_ashes_returned_owner: Date ashes returned to owner
    - (String) cremation_form: The type of cremation
    - (Boolean) cremation_owner_contacted: If the owner has been contacted 
    - (Number) cremation_patient_id: ID of patient to be cremated
    - (Number) cremation_clinic_id: ID of clinic cremation belongs to

  Returns: 
    201: JSON cremation data
    422: Parameters do not pass validation
    500: Error on the server side
*/
exports.addCremation = async (req, res) => {
  const errors = validationResult(req);

  // If errors exist during validation pass them to the user
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    // Destructure request body
    const { 
      cremation_date_collected,
      cremation_date_ashes_returned_practice,
      cremation_date_ashes_returned_owner,
      cremation_form,
      cremation_owner_contacted,
      cremation_patient_id,
      cremation_clinic_id } = req.body;

    let id = 0;

    // Check if patient is already cremated
    const patient = await db.query(
      "SELECT cremation_patient_id FROM cremation WHERE cremation_patient_id = $1", 
      [cremation_patient_id]
    );

    // Send error as patient is already cremated
    if(patient.rows.length > 0) {
      return res.status(403).json(
        `Patient is already cremated!`
      );
    }

    // Check if patient is deactivated
    const patient_status = await db.query(
      "SELECT patient_name, patient_inactive, patient_reason_inactive FROM patient WHERE patient_id = $1", 
      [cremation_patient_id]
    );

    // Send error as patient acc is not deactivated
    if(patient_status.rows[0].patient_inactive !== true) {
      return res.status(403).json(
        `Patient ${patient_status.rows[0].patient_name} is not deactivated!
        Please deactivate before cremating.`
      );
    }

    // Send error as patient acc is not deactivated
    if(patient_status.rows[0].patient_reason_inactive !== 'Patient Deceased') {
      return res.status(403).json(
        `Patient ${patient_status.rows[0].patient_name} is not marked as deceased!
        Please mark patient as deceased in deactivation before cremating.`
      );
    }

    // Format Dates 
    let date_collected;
    let date_returned_practice;
    let date_returned_owner;

    if(cremation_date_collected === '') {
      date_collected = null;
    } else {
      date_collected = cremation_date_collected;
    }

    if(cremation_date_ashes_returned_practice === '') {
      date_returned_practice = null;
    } else {
      date_returned_practice = cremation_date_ashes_returned_practice;
    }

    if(cremation_date_ashes_returned_owner === '') {
      date_returned_owner = null;
    } else {
      date_returned_owner = cremation_date_ashes_returned_owner;
    }
  
    // Insert cremation log into DB
    await db.query(
      `INSERT INTO cremation(
        cremation_date_collected,
        cremation_date_ashes_returned_practice,
        cremation_date_ashes_returned_owner,
        cremation_form,
        cremation_owner_contacted,
        cremation_patient_id,
        cremation_clinic_id ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        date_collected,
        date_returned_practice,
        date_returned_owner,
        cremation_form,
        cremation_owner_contacted,
        cremation_patient_id,
        cremation_clinic_id
      ]
    ).then(res => id = res.rows[0].cremation_id)

    // Update the patient DB record
    await db.query(
      `UPDATE patient
      SET 
        patient_inactive = true,
        patient_reason_inactive = 'Patient Deceased'
      WHERE patient_id = $1`,
      [
        cremation_patient_id
      ]
    );
        
    // Send success response 
    await db.query(
      `SELECT 
        c.cremation_id,
        c.cremation_date_collected, 
        c.cremation_date_ashes_returned_practice, 
        c.cremation_date_ashes_returned_owner,
        c.cremation_form,
        c.cremation_owner_contacted, 
        c.cremation_patient_id,
        p.patient_name, 
        p.patient_microchip
      FROM cremation c
      INNER JOIN patient p ON 
        c.cremation_patient_id = p.patient_id
      WHERE cremation_id = $1;`,
      [id]
    ).then(res => body = res.rows[0])

    res.status(200).send({ 
      message: "Cremation Added Successfully!",
      body
     });
  } catch (err) {
    // Send error response
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /cremations/:id Update a cremation by its ID
  Request params:
    - (Number) id: Cremation ID
  
  Request body:
    - (Date) cremation_date_collected: Date remains were collected from the clinic
    - (Date) cremation_date_ashes_returned_practice: Date ashes were returned to clinic
    - (Date) cremation_date_ashes_returned_owner: Date ashes were given to owner
    - (String) cremation_form: What type of cremation the owner opted for
    - (Boolean) cremation_owner_contacted: Has the owner been contacted
    - (Number) cremation_patient_id: Patient that was cremated

  Returns:
    200: JSON cremation data
    422: Parameters do not pass validation
    500: Error on the server side
*/
exports.updateCremationById = async (req, res) => {
  const errors = validationResult(req);

  // Send errors in cremation validation
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  let id = 0;

  try{
    const cremationId = parseInt(req.params.id);

    // Check if patient is deactivated
    const patient_status = await db.query(
      `SELECT p.patient_name, p.patient_inactive, p.patient_reason_inactive 
      FROM cremation c
      INNER JOIN patient p ON patient_id = cremation_patient_id
      WHERE cremation_id = $1`, 
      [cremationId]
    );

    // Send error as patient acc is not deactivated
    if(patient_status.rows[0].patient_inactive !== true) {
      return res.status(403).json(
        `Patient ${patient_status.rows[0].patient_name} is not deactivated!
        Please deactivate before cremating.`
      );
    }

     // Send error as patient acc is not deactivated
     if(patient_status.rows[0].patient_reason_inactive !== 'Patient Deceased') {
      return res.status(403).json(
        `Patient ${patient_status.rows[0].patient_name} is not marked as deceased!
        Please mark patient as deceased in deactivation before cremating.`
      );
    }

    // Destructure req body
    const { 
      cremation_date_collected,
      cremation_date_ashes_returned_practice,
      cremation_date_ashes_returned_owner,
      cremation_form,
      cremation_owner_contacted,
      cremation_patient_id } = req.body;

    // Format Dates 
    let date_collected;
    let date_returned_practice;
    let date_returned_owner;

    if(cremation_date_collected === '') {
      date_collected = null;
    } else {
      date_collected = cremation_date_collected;
    }

    if(cremation_date_ashes_returned_practice === '') {
      date_returned_practice = null;
    } else {
      date_returned_practice = cremation_date_ashes_returned_practice;
    }

    if(cremation_date_ashes_returned_owner === '') {
      date_returned_owner = null;
    } else {
      date_returned_owner = cremation_date_ashes_returned_owner;
    }
    
    // Update the cremation DB record
    await db.query(
      `UPDATE cremation
      SET 
        cremation_date_collected = $1,
        cremation_date_ashes_returned_practice = $2,
        cremation_date_ashes_returned_owner = $3,
        cremation_form = $4,
        cremation_owner_contacted = $5,
        cremation_patient_id = $6
      WHERE cremation_id = $7
      RETURNING * `,
      [
        date_collected,
        date_returned_practice,
        date_returned_owner,
        cremation_form,
        cremation_owner_contacted,
        cremation_patient_id,
        cremationId
      ]
    ).then(res => id = res.rows[0].cremation_id);

    // Update the patient DB record
    await db.query(
      `UPDATE patient
      SET 
        patient_inactive = true,
        patient_reason_inactive = 'Patient Deceased'
      WHERE patient_id = $1`,
      [
        cremation_patient_id
      ]
    );

    // Send success response 
    await db.query(
      `SELECT 
        c.cremation_id,
        c.cremation_date_collected, 
        c.cremation_date_ashes_returned_practice, 
        c.cremation_date_ashes_returned_owner, 
        c.cremation_form, 
        c.cremation_owner_contacted, 
        c.cremation_patient_id,
        p.patient_name, 
        p.patient_microchip
      FROM cremation c
      INNER JOIN patient p ON 
        c.cremation_patient_id = p.patient_id
      WHERE cremation_id = $1;`,
      [id]
    ).then(res => body = res.rows[0])

    res.status(200).send({ 
      message: "Cremation Updated Successfully!",
      body
     });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  DELETE: /cremations/:id Delete a cremation by its ID
  Request params:
    - (Number) id: Cremation ID

  Returns: 
    200: Success message on deletion
    500: Error on the server side
*/
exports.deleteCremationById = async (req, res) => {
  try {
    const cremationId = parseInt(req.params.id);

    // Check if patient is cremated
     const patient = await db.query(
      "SELECT cremation_id FROM cremation WHERE cremation_id = $1", 
      [cremationId]
    );

    // Send error as patient is not on cremation tables
    if(patient.rows.length === 0) {
      return res.status(403).json(
        `Patient is not in cremation table!`
      );
    }

    // Remove the cremation
    await db.query(`DELETE FROM cremation WHERE cremation_id = $1`, 
      [cremationId]);
  
    res.status(200).send({ message: 'Cremation deleted successfully!', cremationId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};