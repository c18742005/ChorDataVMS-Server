const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'addAnaestheticSheet': {
      return [ 
        body(
          'patient_id', 
          'Patient ID must be an integer number'
        ).exists().isNumeric().trim().escape(),
        body(
          'staff_id', 
          'Staff ID must be an integer number'
        ).exists().isNumeric().trim().escape()
      ]   
    }
    case 'addAnaestheticPeriod': {
      return [ 
        body(
          'id', 
          'Anaesthetic ID must be an integer number'
        ).exists().isNumeric().trim().escape(),
        body(
          'interval', 
          'Interval must be an integer number'
        ).exists().isNumeric().trim().escape(),
        body(
          'hr', 
          'Heart rate must be an integer number'
        ).exists().isNumeric().trim().escape(),
        body(
          'rr', 
          'Resp. rate must be an integer number'
        ).exists().isNumeric().trim().escape(),
        body(
          'eye_pos', 
          'Eye position must be central or ventral'
        ).exists().isIn(["Central", "Ventral"]).trim().escape(),
        body(
          'reflexes', 
          'Reflexes must be a yes or no value'
        ).exists().isIn(["Yes", "No"]).trim().escape(),
      ]   
    }
  }
}