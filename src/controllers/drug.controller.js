const db = require("../config/database");
const { validationResult } = require('express-validator');

// query to list all drugs
exports.listAllDrugs = async (req, res) => {
  try{
    const response = await db.query('SELECT * FROM drug ORDER BY drug_name ASC');
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

// query to get a drug stock by clinic
exports.findDrugStockByClinic = async (req, res) => {
  try{
    const clinicId = parseInt(req.params.id);
    const response = await db.query(
      'SELECT * FROM drug_stock WHERE drug_stock_clinic_id = $1',
      [clinicId]);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

// query to add a drug to a clinics stock
exports.addDrugStockToClinic = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try{
    const { 
      drug_batch_id, 
      drug_expiry_date, 
      drug_quantity,
      drug_concentration,
      drug_stock_drug_id,
      drug_stock_clinic_id } = req.body;

    // Check if batch number exists
    const drug = await db.query(
      "SELECT * FROM drug_stock WHERE drug_batch_id = $1", 
      [drug_batch_id]
    );

    // throw error as batch already exists
    if(drug.rows.length !== 0) {
      return res.status(401).json("Drug with this batch ID is already available");
    }

    const response = await db.query(
      `INSERT INTO drug_stock(
        drug_batch_id,
        drug_expiry_date,
        drug_quantity,
        drug_concentration,
        drug_stock_drug_id,
        drug_stock_clinic_id
      )
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [
        drug_batch_id, 
        drug_expiry_date, 
        drug_quantity, 
        drug_concentration, 
        drug_stock_drug_id, 
        drug_stock_clinic_id
      ]).then(res => body = res.rows[0])

    res.status(201).send({
      message: "Drug Stock added successfully!",
      body
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};

// query to add a drug to a clinics stock
exports.administerDrug = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  
  try{
    const { 
      drug_date_given, 
      drug_quantity_given,
      drug_log_drug_stock_id,
      drug_patient_id,
      drug_staff_id } = req.body;

    // Check if batch number exists
    const drug = await db.query(
      "SELECT * FROM drug_stock WHERE drug_batch_id = $1", 
      [drug_log_drug_stock_id]
    );

    // throw error as batch already exists
    if(drug.rows.length === 0) {
      return res.status(401).json("Drug batch does not exist. Please recheck the batch code");
    }

    const response = await db.query(
      `INSERT INTO drug_log(
        drug_date_administered, 
        drug_quantity_given,
        drug_log_drug_stock_id,
        drug_patient_id,
        drug_staff_id
      )
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [
        drug_date_given, 
        drug_quantity_given,
        drug_log_drug_stock_id,
        drug_patient_id,
        drug_staff_id
      ]).then(res => body = res.rows[0])

    res.status(201).send({
      message: "Drug Log added successfully!",
      body
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};