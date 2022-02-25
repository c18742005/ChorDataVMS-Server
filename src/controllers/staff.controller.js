const db = require("../config/database");

exports.loadStaffMember = async (req, res) => {
  try{
    const staff_member = await db.query(
      `SELECT *
      FROM staff_member
      WHERE staff_member_id = $1`,
      [req.staff_member.staff_member_id]
    );
  
    res.json(staff_member.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}