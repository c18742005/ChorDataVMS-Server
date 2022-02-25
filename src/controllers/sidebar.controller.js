const db = require("../config/database");

exports.loadSidebar = async (req, res) => {
  try{
    const staff_member = await db.query(
      `SELECT clinic_name
      FROM clinic
      WHERE clinic_id = $1`,
      [req.staff_member.staff_clinic_id]
    );
  
    res.json(staff_member.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}