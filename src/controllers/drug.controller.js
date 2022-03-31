/*
  File that handles DB access for drugs
*/
const db = require("../config/database");
const { validationResult } = require('express-validator');

/*
  GET: /drugs Retrieve all drugs

  Returns: 
    200: JSON drug data
    500: Error on the server side
*/
exports.listAllDrugs = async (req, res) => {
  try{
    const response = await db.query('SELECT * FROM drug ORDER BY drug_name ASC');

    if(response.rows.length === 0) {
      return res.status(500).json("Failed to retrieve drug names from server");
    }

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /drugs/:id Retrieve drugs by their clinic ID
  Request params:
    - (Number) id: Clinic ID

  Returns: 
    200: JSON drug stock data
    401: Clinic does not exist
    500: Error on the server side
*/
exports.findDrugsStockByClinic = async (req, res) => {
  try{
    const clinicId = parseInt(req.params.id);

    // check clinic exists
    const clinic = await db.query(`
      SELECT * FROM clinic
      WHERE clinic_id = $1`,
      [clinicId]
    );

    if(clinic.rows.length === 0) {
      return res.status(401).json("Clinic does not exist");
    }

    const response = await db.query(
      'SELECT * FROM drug_stock WHERE drug_stock_clinic_id = $1',
      [clinicId]);

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /drugs/log/:drugid/:clinicid Retrieve drug log by drug ID and clinic ID
  Request params:
    - (Number) clinicid: Clinic ID
    - (Number) drugid: Drug ID

  Returns: 
    200: JSON drug stock data
    401: Drug or clinic does not exist
    500: Error on the server side
*/
exports.findDrugStockByClinic = async (req, res) => {
  try{
    const clinicId = parseInt(req.params.clinicid);
    const drugId = parseInt(req.params.drugid);

    // check clinic exists
    const clinic = await db.query(`
      SELECT * FROM clinic
      WHERE clinic_id = $1`,
      [clinicId]
    );

    if(clinic.rows.length === 0) {
      return res.status(401).json("Clinic does not exist");
    }

    // check drug exists
    const drug = await db.query(`
      SELECT * FROM drug
      WHERE drug_id = $1`,
      [drugId]
    );

    if(drug.rows.length === 0) {
      return res.status(401).json("Drug does not exist");
    }

    const response = await db.query(
      'SELECT * FROM drug_stock WHERE drug_stock_clinic_id = $1 AND drug_stock_drug_id = $2',
      [clinicId, drugId]
    );

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  GET: /drugs/:drugid/:clinicid Retrieve specific drug log by drug ID and clinic ID
  Request params:
    - (Number) clinicid: Clinic ID
    - (Number) drugid: Drug ID

  Returns: 
    200: JSON drug stock data
    500: Error on the server side
*/
exports.findDrugLogByClinic = async (req, res) => {
  try{
    const clinicId = parseInt(req.params.clinicid);
    const drugId = parseInt(req.params.drugid);

    const response = await db.query(
      `SELECT 
        dl.drug_quantity_given, dl.drug_date_administered, 
        ds.drug_batch_id, ds.drug_quantity_measure, 
        p.patient_name, 
        p.patient_microchip,
        sm.staff_username 
      FROM drug_log dl
      INNER JOIN drug_stock ds ON 
        dl.drug_log_drug_stock_id = ds.drug_batch_id
      INNER JOIN patient p ON 
        dl.drug_patient_id = p.patient_id
      INNER JOIN staff_member sm ON 
        dl.drug_staff_id = sm.staff_member_id
      WHERE drug_log_drug_stock_id IN (
        SELECT drug_batch_id FROM drug_stock 
        WHERE drug_stock_drug_id = $1
        AND drug_stock_clinic_id = $2
      )
      ORDER BY dl.drug_date_administered DESC;`,
      [drugId, clinicId]
    );

    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /drugs Add drug to a clinics stock
  Request params:
    - (Number) drug_batch_id: Batch ID of the drug
    - (String) drug_expiry_date: Date the drug expires
    - (Number) drug_quantity: Quantity of the drug
    - (String) drug_quantity_measure: The measure used for the drug i.e. ml, tablet
    - (String) drug_concentration: How strong the drug is
    - (Number) drug_stock_drug_id: The drug ID the stock belongs to
    - (Number) drug_stock_clinic_id: The clinic ID the drug belongs to

  Returns: 
    201: JSON drug stock data
    400: Clinic or Drug does not exist
    409: Batch ID already exists
    422: Errors in validating the drug stock
    500: Error on the server side
*/
exports.addDrugStockToClinic = async (req, res) => {
  const errors = validationResult(req);

  // Return validation errors
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    // Destructure body
    const { 
      drug_batch_id,
      drug_stock_drug_id,
      drug_stock_clinic_id } = req.body;

    // Check if batch number exists
    const drug_batch = await db.query(
      "SELECT * FROM drug_stock WHERE drug_batch_id = $1", 
      [drug_batch_id]
    );

    // throw error as batch already exists
    if(drug_batch.rows.length !== 0) {
      return res.status(409).json("Cannot add stock. Drug with this batch ID is already available");
    }

    // Check if drug exists
    const drug = await db.query(
      "SELECT * FROM drug WHERE drug_id = $1", 
      [drug_stock_drug_id]
    );

    // throw error as drug does not exist
    if(drug.rows.length === 0) {
      return res.status(400).json("Cannot add stock to drug. Drug does not exist");
    }

    // Check if clinic exists
    const clinic = await db.query(
      "SELECT * FROM clinic WHERE clinic_id = $1", 
      [drug_stock_clinic_id]
    );

    // throw error as drug does not exist
    if(clinic.rows.length === 0) {
      return res.status(400).json("Cannot add stock to drug. Clinic does not exist");
    }

    // Add drug stock to DB
    const response = await this.addDrugStock(req.body);

    if(response === 500) {
      return res.status(500).json("Server error adding drug to stock. Please try again")
    }

    res.status(201).send({
      message: "Drug Stock added successfully",
      body: response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  POST: /drugs/log Add drug to drug log
  Request params:
    - (String) drug_date_given: Date the drug was administered
    - (Number) drug_quantity_given: Quantity of the drug administered
    - (String) drug_quantity_measure: The measure used for the drug i.e. ml, tablet
    - (Number) drug_log_drug_stock_id: The batch ID of the drug stock
    - (Number) drug_patient_id: The patient ID the drug is administered to
    - (Number) drug_staff_id: The staff ID of the administer 

  Returns: 
    200: JSON drug log data
    400: Not enough drug in stock
    401: Staff is not authorised to administer drug
    403: Patient is inactive
    404: Batch ID does not exist
    422: Errors in validating the log entry
    500: Error on the server side
*/
exports.administerDrug = async (req, res) => {
  const errors = validationResult(req);

  // Send validation errors to client
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  
  try{
    // Destructure body or req
    const { 
      drug_quantity_given,
      drug_quantity_measure,
      drug_log_drug_stock_id,
      drug_patient_id,
      drug_staff_id } = req.body;

    // Check if batch number exists
    const drug = await db.query(
      "SELECT * FROM drug_stock WHERE drug_batch_id = $1", 
      [drug_log_drug_stock_id]
    );

    // Send error as batch does not exist
    if(drug.rows.length === 0) {
      return res.status(404).json(
        "Drug batch does not exist. Please recheck the batch code"
      );
    }

     // Send error if measures don't match
     if(drug.rows[0].drug_quantity_measure !== drug_quantity_measure) {
      return res.status(403).json(
        `Wrong unit of measure for batch ${drug.rows[0].drug_batch_id}.
        This batch uses ${drug.rows[0].drug_quantity_measure}. 
        You are attempting to use ${drug_quantity_measure}.
        Please use the correct measurement when administering`
      );
    }

    // Send error if not enough in stock
    if(drug.rows[0].drug_quantity_remaining < parseFloat(drug_quantity_given)) {
      return res.status(400).json(
        `Not enough drugs left in batch ${drug.rows[0].drug_batch_id}.
        ${drug.rows[0].drug_quantity_remaining}${drug.rows[0].drug_quantity_measure} remaining.
        Please use the remaining amount from this batch before starting a new batch`
      );
    }

    // Check if patient is deactivated
    const patient = await db.query(
      "SELECT patient_name, patient_inactive FROM patient WHERE patient_id = $1", 
      [drug_patient_id]
    );

    // Send error as patient is inactive
    if(patient.rows[0].patient_inactive === true) {
      const patient_name = patient.rows[0].patient_name
      return res.status(403).json(
        `Patient (${patient_name}) is inactive. 
        Please reactivate ${patient_name} before administering drug`
      );
    }

    // Check if staff member is a vet before administering a drug
    const staff_can_admin = await db.query(
      "SELECT staff_username, staff_role FROM staff_member WHERE staff_member_id = $1", 
      [drug_staff_id]
    );

    // Send error as staff is unauthorised to administer drug
    if(staff_can_admin.rows.length === 0 || staff_can_admin.rows[0].staff_role !== "Vet") {
      return res.status(401).json(
        `Staff member is not a vet. 
        Please ensure the drug is administered by a certified vet`
      );
    }

    // Add drug log to DB
    const response = await this.addDrugLog(req.body);

    if(response === 500) {
      return res.status(500).json("Server error adding drug to log. Please try again")
    }

    res.status(201).send({ 
      message: "Drug successfully administered",
      body: response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

/*
  Add stock to the drug_stock table
  Request params:
    - (Object) stock: details of stock to add to db

  Returns: 
    (Success) Object: new stock added
    (Error) Integer: 500
*/
exports.addDrugStock = async (stock) => {
  try {
    // Add stock to DB
    const response = await db.query(
    `INSERT INTO drug_stock(
      drug_batch_id,
      drug_expiry_date,
      drug_quantity,
      drug_quantity_measure,
      drug_quantity_remaining,
      drug_concentration,
      drug_stock_drug_id,
      drug_stock_clinic_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
    [
      stock.drug_batch_id, 
      stock.drug_expiry_date, 
      stock.drug_quantity, 
      stock.drug_quantity_measure,
      stock.drug_quantity,
      stock.drug_concentration, 
      stock.drug_stock_drug_id, 
      stock.drug_stock_clinic_id
    ])

    if(response.rows.length === 0) {
      return 500;
    }

    return response.rows[0];
  } catch(err) {
    console.error(err)
    return 500;
  }
}

/*
  Add a log to the drug_log table
  Request params:
    - (Object) log: Details of the log to add to DB

  Returns: 
    (Success) Object: THe newly added log details
    (Error) Integer: 500
*/
exports.addDrugLog = async (log) => {
  let id = 0;

  // Add log to DB
  try {
    // Insert log into DB
    await db.query(
      `INSERT INTO drug_log(
        drug_date_administered, 
        drug_quantity_given,
        drug_log_drug_stock_id,
        drug_patient_id,
        drug_staff_id
      )
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING drug_log_id`,
      [
        log.drug_date_given, 
        log.drug_quantity_given,
        log.drug_log_drug_stock_id,
        log.drug_patient_id,
        log.drug_staff_id
      ]
    ).then(res => {
      id = res.rows[0].drug_log_id
    })

    // Update quantity in drug stock
    await db.query(
      `UPDATE drug_stock
      SET
        drug_quantity_remaining = drug_quantity_remaining - $1
      WHERE drug_batch_id = $2`,
      [
        log.drug_quantity_given,
        log.drug_log_drug_stock_id
      ]
    )

    const response = await db.query(
      `SELECT 
        dl.drug_quantity_given, dl.drug_date_administered, 
        ds.drug_batch_id, ds.drug_quantity_measure, 
        p.patient_name, 
        p.patient_microchip,
        sm.staff_username 
      FROM drug_log dl
      INNER JOIN drug_stock ds ON 
        dl.drug_log_drug_stock_id = ds.drug_batch_id
      INNER JOIN patient p ON 
        dl.drug_patient_id = p.patient_id
      INNER JOIN staff_member sm ON 
        dl.drug_staff_id = sm.staff_member_id
      WHERE drug_log_id = $1;`,
      [id]
    )
  
    if(response.rows.length === 0) {
      return 500;
    }

    return response.rows[0];
  } catch(err) {
    console.error(err)
    return 500;
  }
}