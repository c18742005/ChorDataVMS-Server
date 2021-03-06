/*
  File that handles DB access for xrays
*/
const db = require("../config/database");
const { validationResult } = require('express-validator')
 
/*
  GET: /xrays/clinic/:id Retrieve all xrays for a clinic by their clinic ID
  Request params:
    - (String) id: Clinic ID

  Returns: 
    200: JSON xray data
    500: Error on the server side
*/
exports.findXraysByClinicId = async (req, res) => {
  try{
    const clinicId = req.params.id;

    const response = await db.query(
      `SELECT 
        x.xray_id,
        x.xray_date, 
        x.xray_image_quality, 
        x.xray_kV,
        x.xray_mAs,
        x.xray_position,
        x.xray_patient_id,
        p.patient_name, 
        p.patient_microchip,
        sm.staff_username 
      FROM xray x
      INNER JOIN patient p ON 
        x.xray_patient_id = p.patient_id
      INNER JOIN staff_member sm ON 
        x.xray_staff_id = sm.staff_member_id
      WHERE xray_clinic_id = $1;`,
      [clinicId]);

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /xrays/patient/:id Retrieve all xrays for a patient by their patient ID
  Request params:
    - (Number) id: Patient ID

  Returns: 
    200: JSON xray data
    500: Error on the server side
*/
exports.findXraysByPatientId = async (req, res) => {
  try{
    const patientId = parseInt(req.params.id);

    const response = await db.query(
      `SELECT 
        x.xray_id,
        x.xray_date, 
        x.xray_image_quality, 
        x.xray_kV,
        x.xray_mAs,
        x.xray_position,
        p.patient_name, 
        p.patient_microchip,
        sm.staff_username 
      FROM xray x
      INNER JOIN patient p ON 
        x.xray_patient_id = p.patient_id
      INNER JOIN staff_member sm ON 
        x.xray_staff_id = sm.staff_member_id
      WHERE xray_patient_id = $1;`,
      [patientId]);

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /xrays Add an xray to the table
  Request body:
    - (String) xray_date: Date Xray was taken
    -  (String) xray_image_quality: Quality of the image
    -  (Number) xray_kV: kV measurement of Xray
    -  (Number) xray_mAs: mAs measurement of Xray 
    - (String) xray_position: Position xray is taken in
    -  (Number) xray_patient_id: ID of patient to be x-rayed
    -  (Number) xray_staff_id: ID of staff member who took the x-ray
    - (String) xray_clinic_id: ID of clinic x-ray belongs to

  Returns: 
    201: JSON xray data
    403: Patient is inactive
    422: Parameters do not pass validation
    500: Error on the server side
*/
exports.addXray = async (req, res) => {
  const errors = validationResult(req);

  // If errors exist during validation pass them to the user
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    // Retrieve patient ID from request body
    const { xray_patient_id } = req.body;

    // Check if patient is deactivated
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [xray_patient_id]
    );

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      const patient_name = patient.rows[0].patient_name
      return res.status(403).json(
        `Patient (${patient_name}) is inactive. 
        Please reactivate ${patient_name} before taking xray`
      );
    }

    const response = await this.insertXray(req.body);

    if(response === 500) {
      res.status(500).json("Internal Server Error: X-ray failed to upload. Please try again")
    }

    res.status(201).send({ 
      message: "X-ray Added Successfully",
      body: response
     });
  } catch (err) {
    // Send error response
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  PUT: /xrays/:id Update an xray by its ID
  Request params:
    - (Number) id: X-ray ID

  Returns:
    200: JSON xray data
    403: Patient is inactive
    422: Parameters do not pass validation
    500: Error on the server side
*/
exports.updateXrayById = async (req, res) => {
  const errors = validationResult(req);

  // Send errors in xray validation
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    const xrayId = parseInt(req.params.id);

    // Get the patient ID from the request body
    const { xray_patient_id } = req.body;

    // Check if patient is deactivated
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [xray_patient_id]
    );

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      const patient_name = patient.rows[0].patient_name
      return res.status(403).json(
        `Patient (${patient_name}) is inactive. 
        Please reactivate ${patient_name} before taking xray`
      );
    }

    // Update X-ray in DB
    const response = await this.updateXray(xrayId, req.body)

    if(response === 500) {
      return res.status(500).json("Server Error: X-ray unable to be updated. Please try again")
    }

    res.status(201).send({ 
      message: "X-ray Updated Successfully",
      body: response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  Add an xray to the database and return xray details
  Request params:
    - (Object) xray details

  Returns:
    (Success) Xray Object
    (Error) Integer: 500
*/
exports.insertXray = async (xray) => {
  let id = 0;

  try {
    // Insert xray log into DB
    await db.query(
      `INSERT INTO xray(
        xray_date,
        xray_image_quality,
        xray_kV,
        xray_mAs,
        xray_position,
        xray_patient_id,
        xray_staff_id,
        xray_clinic_id ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        xray.xray_date,
        xray.xray_image_quality,
        xray.xray_kV,
        xray.xray_mAs,
        xray.xray_position,
        xray.xray_patient_id,
        xray.xray_staff_id,
        xray.xray_clinic_id
      ]
    ).then(res => id = res.rows[0].xray_id)
        
    // Send success response 
    const response = await db.query(
      `SELECT 
        x.xray_id,
        x.xray_date, 
        x.xray_image_quality, 
        x.xray_kV,
        x.xray_mAs,
        x.xray_position,
        x.xray_patient_id,
        p.patient_name, 
        p.patient_microchip,
        sm.staff_username 
      FROM xray x
      INNER JOIN patient p ON 
        x.xray_patient_id = p.patient_id
      INNER JOIN staff_member sm ON 
        x.xray_staff_id = sm.staff_member_id
      WHERE xray_id = $1;`,
      [id]
    )

      // Error
      if(response.rows.length === 0) {
        return 500;
      }

      return response.rows[0];
  } catch (err) {
    console.error(err.message);
    return 500;
  }
}

/*
  Update an xray in the database
  Request params:
    - (Object) xray: xray details
    - (Integer) xray_id: ID of xray to update

  Returns:
    (Success) Xray Object
    (Error) Integer: 500
*/
exports.updateXray = async (xray_id, xray) => {
  let id = 0;
  
  try {
    // Update the client DB record
    await db.query(
      `UPDATE xray
      SET 
        xray_date = $1,
        xray_image_quality = $2,
        xray_kV = $3,
        xray_mAs = $4,
        xray_position = $5,
        xray_patient_id = $6,
        xray_staff_id = $7
      WHERE xray_id = $8
      RETURNING * `,
      [
        xray.xray_date,
        xray.xray_image_quality,
        xray.xray_kV,
        xray.xray_mAs,
        xray.xray_position,
        xray.xray_patient_id,
        xray.xray_staff_id,
        xray_id
      ]
    ).then(res => id = res.rows[0].xray_id);

    const response = await db.query(
      `SELECT 
        x.xray_id,
        x.xray_date, 
        x.xray_image_quality, 
        x.xray_kV,
        x.xray_mAs,
        x.xray_position,
        x.xray_patient_id,
        p.patient_name, 
        p.patient_microchip,
        sm.staff_username 
      FROM xray x
      INNER JOIN patient p ON 
        x.xray_patient_id = p.patient_id
      INNER JOIN staff_member sm ON 
        x.xray_staff_id = sm.staff_member_id
      WHERE xray_id = $1;`,
      [id]
    )

    // Error
    if(response.rows.length === 0) {
      return 500;
    }

    return response.rows[0];
  } catch (err) {
    console.error(err.message);
    return 500;
  }
}