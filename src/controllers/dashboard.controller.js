const db = require("../config/database");

exports.loadDashboard = async (req, res) => {
  try{
    const staff_member = await db.query(
      `SELECT staff_member.staff_username, clinic.clinic_name 
      FROM staff_member, clinic 
      WHERE staff_member.staff_clinic_id = clinic.clinic_id 
      AND staff_member.staff_member_id = $1`,
      [req.staff_member]
    );
  
    res.json(staff_member.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}