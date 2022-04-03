/*
  File that handles the DB requests needed to load the sidebar
*/
const db = require("../config/database");

/*
  GET: /sidebar/ Retrieve data for use in the sidebar
  Request params:
    - (String): ID of the clinic

  Returns: 
    200: JSON clinic data
    500: Error on the server side
*/
exports.loadSidebar = async (req, res) => {
  try{
    const clinicId = req.staff_member.staff_clinic_id;

    const staff_member = await db.query(
      `SELECT clinic_name
      FROM clinic
      WHERE clinic_id = $1`,
      [clinicId]
    );
  
    res.status(200).json(staff_member.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}