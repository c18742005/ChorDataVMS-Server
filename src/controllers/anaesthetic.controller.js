const db = require("../config/database");

/*
  GET: /anaesthetic/:id Retrieve all anaesthetic sheets of a patient by their ID
  Request params:
    - (Number) id: Patient ID

  Returns: 
    200: JSON anaesthetic data
    401: No patient available with this ID
    500: Error on the server side
*/
exports.findAnaestheticsByPatientId = async (req, res) => {
  try{
    const patientId = parseInt(req.params.id);

    // Check patient exists 
    const patient = await db.query(
      `SELECT * FROM patient
      WHERE patient_id = $1`,
      [patientId]
    );

    if(patient.rows.length === 0) {
      return res.status(400).json("No such patient with ID supplied");
    }

    const anaesthetic_sheets = await db.query(
      `SELECT a.anaesthetic_id, a.anaesthetic_patient_id, a.anaesthetic_date, sm.staff_username  
      FROM anaesthetic a
      INNER JOIN staff_member sm ON 
        a.anaesthetic_staff_id = sm.staff_member_id
      WHERE a.anaesthetic_patient_id = $1`,
      [patientId]
    );

    res.status(200).send(anaesthetic_sheets.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /patient/anaesthetic/:id Retrieve an anaesthetic sheet of a patient by the anaesthetic ID
  Request params:
    - (Number) id: Anaesthetic ID

  Returns: 
    200: JSON anaesthetic data and periods data
    401: No anaesthetic available with this ID
    500: Error on the server side
*/
exports.findAnaestheticById = async (req, res) => {
  try{
    const anaestheticId = parseInt(req.params.id);

    // Check anaesthetic exists 
    const anaesthetic = await db.query(
      `SELECT * FROM anaesthetic
      WHERE anaesthetic_id = $1`,
      [anaestheticId]
    );

    if(anaesthetic.rows.length === 0) {
      return res.status(400).json("No such anaesthetic with ID supplied");
    }

    const anaesthetic_sheet = await db.query(
      `SELECT a.anaesthetic_id, a.anaesthetic_patient_id, a.anaesthetic_date, sm.staff_username, p.patient_name  
      FROM anaesthetic a
      INNER JOIN staff_member sm ON 
        a.anaesthetic_staff_id = sm.staff_member_id
      INNER JOIN patient p ON 
        a.anaesthetic_patient_id = p.patient_id
      WHERE a.anaesthetic_id = $1`,
      [anaestheticId]
    );

    if(anaesthetic_sheet.rows.length === 0) {
      return res.status(500).json("Server error retrieving anaesthetic sheet. Please try again");
    }

    const anaesthetic_periods = await db.query(
      `SELECT *
      FROM anaesthetic_period
      WHERE anaesthetic_id = $1`,
      [anaestheticId]
    );

    res.status(200).send({ 
      anaesthetic_sheet: anaesthetic_sheet.rows[0],
      anaesthetic_periods: anaesthetic_periods.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /anaesthetic Add an anaesthetic sheet to the DB
  Request body:
    - (Number) patient_id: ID of patient the anaesthetic is completed on
    - (Number) staff_id: ID of staff who performed the anaesthetic monitoring

  Returns: 
    201: JSON anaesthetic data
    400: No patient/staff member available with this ID
    403: Patient is inactive or staff member is not authorised 
    500: Error on the server side
*/
exports.addAnaesthetic = async (req, res) => {
  try{
     // Destructure the request.body
     const { patient_id, staff_id } = req.body;

    // Check patient exists and is not deactivated
    const patient = await db.query(
      `SELECT * FROM patient
      WHERE patient_id = $1`,
      [patient_id]
    );

    // Send error as patient does not exist
    if(patient.rows.length === 0) {
      return res.status(400).json("No such patient with ID supplied");
    }

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      return res.status(403).send(
        `${patient.rows[0].patient_name} is inactive.
        Please reactivate the patient before performing the anaesthetic procedure`);
    }

    // Check staff exists and are authorised to perform the monitoring
    const staff = await db.query(
      `SELECT * FROM staff_member
      WHERE staff_member_id = $1`,
      [staff_id]
    );

    // Send error as staff does not exist
    if(staff.rows.length === 0) {
      return res.status(400).json("No such staff member with ID supplied");
    }

    // Send error as staff does not have permission to perform monitoring
    if(staff.rows[0].staff_role !== "Vet" && staff.rows[0].staff_role !== "Nurse") {
      return res.status(403).json(
        `${staff.rows[0].staff_username} is not authorised to perform anaesthetic monitoring.
        Please use an authorised vet or vet nurse to perform the monitoring procedure`
      );
    }

    const anaesthetic = await this.insertAnaesthetic(patient_id, staff_id);

    if(anaesthetic === 500) {
      return res.status(500).json("Server error adding anaesthetic. Please try again");
    }

    res.status(201).send({ 
      message: "Anaesthetic started successfully",
      body: anaesthetic
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

/*
  POST: /anaesthetic/period Add an anaesthetic period to an anaesthetic sheet
  Request body:
    - (Number) id: Anaesthetic ID

  Returns: 
    201: JSON anaesthetic period data
    401: No patient available with this ID
    500: Error on the server side
*/
exports.addAnaestheticPeriod = async (req, res) => {
  try{
     // Destructure the request.body
     const { id } = req.body;

    // Check anaesthetic sheet exists 
    const anaesthetic = await db.query(
      `SELECT * FROM anaesthetic
      WHERE anaesthetic_id = $1`,
      [id]
    );

    if(anaesthetic.rows.length === 0) {
      return res.status(400).json("No such anaesthetic sheet with ID supplied");
    }

    const period = await this.insertAnaestheticPeriod(req.body);

    if(period === 500) {
      return res.status(500).json("Server error adding anaesthetic period. Please try again");
    }

    res.status(201).send({ 
      message: "Anaesthetic period added successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

/*
  Insert New Anaesthetic into DB

  Returns:
    (Success) Object: anaesthetic object created
    (Error) Integer: 500
*/
exports.insertAnaesthetic = async (patient_id, staff_id) => {
  try {
    // Insert client into DB 
    const anaesthetic = await db.query(
      `INSERT INTO anaesthetic(anaesthetic_patient_id, anaesthetic_date, anaesthetic_staff_id) 
      VALUES ($1, $2, $3)
      RETURNING *`,
      [patient_id, new Date().toISOString(), staff_id]
    );

    if(anaesthetic.rows.length === 0) {
      return 500;
    }

    return anaesthetic.rows[0];
  } catch (err) {
    console.error(err.message);
    return 500;
  }
}

/*
  Insert New Anaesthetic Period into DB

  Returns:
    (Success) Object: anaesthetic period object created
    (Error) Integer: 500
*/
exports.insertAnaestheticPeriod = async (info) => {
  try {
    // Insert anaesthetic period into DB 
    const period = await db.query(
      `INSERT INTO anaesthetic_period(
        anaesthetic_id, 
        anaesthetic_period, 
        anaesthetic_hr,
        anaesthetic_rr,
        anaesthetic_oxygen,
        anaesthetic_agent,
        anaesthetic_eye_pos,
        anaesthetic_reflexes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [info.id, info.interval, info.hr, info.rr, info.oxygen, info.agent, info.eye_pos, info.reflexes]
    );

    if(period.rows.length === 0) {
      return 500;
    }

    return period.rows[0];
  } catch (err) {
    console.error(err.message);
    return 0;
  }
}