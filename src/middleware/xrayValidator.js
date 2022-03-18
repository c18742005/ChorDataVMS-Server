/*
    JavaScript file that validates xray forms
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'validateXrayForm': {
      return [ 
        body(
          'xray_date', 
          'Date must be a valid date')
          .exists().isISO8601().trim().escape(),
        body(
          'xray_image_quality', 
          'Image quality can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'xray_kV', 
          'X-ray kV cannot be empty and must be between 0.01 and 19.99')
          .exists().isFloat({ min: 0.01, max: 19.99 }).isLength({min:1, max: 254}).trim().escape(),
        body(
          'xray_mAs', 
          'X-ray mAs cannot be empty and must be between 0.01 and 19.99')
          .exists().isFloat({ min: 0.01, max: 19.99 }).isLength({min:1, max: 254}).trim().escape(),
        body(
          'xray_position', 
          'X-ray position cannot be empty and must only use alphanumeric characters')
          .exists().isAlphanumeric("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'xray_patient_id', 
          'Patient ID must be numeric and cannot be empty')
          .exists().isNumeric({no_symbols: true}).isLength({min:1, max: 254}).trim().escape()
      ]   
    }
  }
}