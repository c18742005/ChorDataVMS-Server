/*
    JavaScript file that validates cremation forms
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'validateCremationForm': {
      return [ 
        body(
          'cremation_date_collected', 
          'Date must be a valid date')
          .optional({checkFalsy: true}).isISO8601().trim().escape(),
        body(
          'cremation_date_ashes_returned_practice', 
          'Date must be a valid date')
          .optional({checkFalsy: true}).isISO8601().trim().escape(),
        body(
          'cremation_date_ashes_returned_owner', 
          'Date must be a valid date')
          .optional({checkFalsy: true}).isISO8601().trim().escape(),
        body(
          'cremation_form', 
          'Cremation form can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " "}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'cremation_owner_contacted', 
          'Contacted must be a yes or no value')
          .exists().trim().isIn(["Yes", "No"]).escape()
      ]   
    }
  }
}