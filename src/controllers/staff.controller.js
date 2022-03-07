/*
  File that handles DB access for staff members
*/
const db = require("../config/database");

/*
  GET: /staff Retrieve a staff member by their ID
  Request params:
    - (Number) staff_member_id: ID of staff member

  Returns: 
    200: JSON staff data
    500: Error on the server side
*/
exports.loadStaffMember = async (req, res) => {
  try{
    const staff_id = parseInt(req.staff_member.staff_member_id);

    // Retrieve staff member from DB
    const staff_member = await db.query(
      `SELECT *
      FROM staff_member
      WHERE staff_member_id = $1`,
      [staff_id]
    );

    // Send error as staff member does not exist
    if(staff_member.rows.length === 0) {
      return res.status(404).json("Staff member with this ID does not exist");
    }
  
    res.status(200).json(staff_member.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}