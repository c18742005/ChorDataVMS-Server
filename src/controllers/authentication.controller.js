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

/*
  Register a staff member with the system
  Request body:
    - (String) username: new staff username for the user
    - (String) password: users new password
    - (String) role - The job role they have
    - (String) clinic_id - The clinic they are being added to

  Returns: 
    422: Parameters do not pass validation
    409: username is already taken
    404: clinic does not exist
    500: Error on the server side
    201: JSON object with token and user details
*/
exports.registerStaffMember = async (req, res) => {
  const errors = validationResult(req);

  // If errors exist during validation pass them to the user
  if(!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  // Destructure the request.body
  const { username, password, role, clinic_id } = req.body;
  const usernameToLower = username.toLowerCase();
  
  try {
    // Check if username taken
    const staff_member = await db.query(
      "SELECT * FROM staff_member WHERE staff_username = $1", 
      [usernameToLower]
    );

    // Send error res as username is taken
    if(staff_member.rows.length !== 0) {
      return res.status(409).json("Username already taken");
    }

    // Check clinic exists
    const clinic = await db.query(
      "SELECT * FROM clinic WHERE clinic_id = $1", 
      [clinic_id]
    );

    // Send error as clinic does not exist
    if(clinic.rows.length === 0) {
      return res.status(404).json("Clinic does not exist");
    }

    // Hash user password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const staff_info = await this.insertStaff(usernameToLower, bcryptPassword, role, clinic_id);

    // Generate a jwt token
    if (staff_info !== 0) {
      const token = jwtGenerator(staff_info);
      return res.status(201).json({ token, staff_info });
    }

    return res.status(401).json("Error inserting new staff");

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

/*
  Login a staff member
  Request body:
    - (String) username: staff username for the user
    - (String) password: users password

  Returns: 
    422: Parameters do not pass validation
    401: username/password combo does not exist
    500: Error on the server side
    200: JSON object with token and user details
*/
exports.loginStaffMember = async (req, res) => { 
  try {
    const errors = validationResult(req);

    // Send error if params don't pass validation
    if(!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

    // Destructure the request.body
    const { username, password } = req.body;
    const usernameToLower = username.toLowerCase();

    // Check staff member exists
    const staff_member = await this.getStaffByUsername(usernameToLower);

    // Return 401 error as username or password is incorrect
    if(staff_member.rows.length === 0) {
      return res.status(401).json("Username/Password is incorrect");
    }

    // Check if incoming password matches DB password
    const validPassword = await bcrypt.compare(password, staff_member.rows[0].staff_password);

    // Return 401 error as username or password is incorrect
    if(!validPassword) {
      return res.status(401).json("Username/Password is incorrect");
    }

    // Give user JWT token
    const token = jwtGenerator(staff_member.rows[0]);
    const staff_info = staff_member.rows[0];

    res.status(201).json({ token, staff_info });

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

/*
  Verify a staff member

  Returns: 
    200: Verified is true
    500: Error on the server side
*/
exports.verifyStaffMember = async (req, res) => {
  try {
    res.status(200).json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}

/*
  Insert New Staff Into DB

  Returns:
    (Success) Object: staff_member object created
    (Error) Integer: 0
*/
exports.insertStaff = async (username, password, role, clinic_id) => {
  try {
    const new_staff = await db.query(
      `INSERT INTO staff_member (staff_username, staff_password, staff_role, staff_clinic_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`, 
      [username, password, role, clinic_id]
    );

    return new_staff.rows[0];
  } catch (err) {
    console.error(err.message);
    return 0;
  }
}

/*
  Get Staff From DB

  Returns:
    (Success) Object: staff_member object created
    (Error) Integer: 0
*/
exports.getStaffByUsername = async (username) => {
  try {
    const staff_members = await db.query(
      "SELECT * FROM staff_member WHERE staff_username = $1", 
      [username]
    );

    return staff_members;
  } catch (err) {
    console.error(err.message);
    return 0;
  }
}