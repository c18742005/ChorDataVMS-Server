/*
    JavaScript file that models the APIs required for:
        * Logging in a staff member
        * Registering a staff member
        * Verifying a staff member
*/
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("../utils/jwtGenerator");
const { validationResult } = require('express-validator')

// Register staff member
exports.registerStaffMember = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  // Destructure the request.body (name, email, password)
  const { username, password, role, clinic_id } = req.body;
  
  try {
    // Check if username taken
    const staff_member = await db.query(
      "SELECT * FROM staff_member WHERE staff_username = $1", 
      [username]
    );

    // throw error as username is taken
    if(staff_member.rows.length !== 0) {
      return res.status(401).json("Username already taken");
    }

    // Check clinic exists. If not throw error
    const clinic = await db.query(
      "SELECT * FROM clinic WHERE clinic_id = $1", 
      [clinic_id]
    );

    if(clinic.rows.length === 0) {
      return res.status(401).json("Clinic does not exist");
    }

    // Bcrypt their password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Enter staff_member into database
    const newStaff = await db.query(
      "INSERT INTO staff_member (staff_username, staff_password, staff_role, staff_clinic_id) VALUES ($1, $2, $3, $4) RETURNING *", 
      [username, bcryptPassword, role, clinic_id]
    );

    // Generate a jwt token
    const token = jwtGenerator(newStaff.rows[0].staff_member_id);
    const staff_info = newStaff.rows[0];

    res.json({ token, staff_info });

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

// Login staff member
exports.loginStaffMember = async (req, res) => { 
  try {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

    // Destructure the request.body (username, password)
    const { username, password } = req.body;

    // Check staff member exists. If not throw error
    const staff_member = await db.query(
      "SELECT * FROM staff_member WHERE staff_username = $1", 
      [username]
    );

    if(staff_member.rows.length === 0) {
      return res.status(401).json("User does not exist");
    }

    // Check if incoming password matches DB password
    const validPassword = await bcrypt.compare(password, staff_member.rows[0].staff_password);

    if(!validPassword) {
      return res.status(401).json("Password is incorrect");
    }

    // Give them JWT token
    const token = jwtGenerator(staff_member.rows[0].staff_member_id);
    const staff_info = staff_member.rows[0];

    res.json({ token, staff_info });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

// Verify staff member
exports.verifyStaffMember = async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}