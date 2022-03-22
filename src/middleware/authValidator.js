/*
    JavaScript file that validates login and register forms
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'loginStaffMember': {
      return [ 
        body(
          'username', 
          'Username must have a value and must be greater than 5 characters'
        ).exists().isAlpha("en-GB").isLength({min:5, max: 254}).trim().escape(),
        body(
          'password', 
          'Password is too weak. Password should contain at least: ' +
          '8 characters\n' +
          '1 Lowercase letter, \n' +
          '1 Uppercase letter, \n' +
          '1 Number, and \n' +
          '1 Symbol'
        ).isStrongPassword().isLength({min:8, max: 254}).trim().escape()
      ]   
    }
    case 'registerStaffMember': {
      return [ 
        body(
          'username', 
          'Username must have a value and be greater than 5 characters'
        ).exists().isAlpha("en-GB").isLength({min:5, max: 254}).trim().escape(),
        body(
          'password', 
          'Password is too weak. Password should contain at least: ' +
          '8 characters\n' +
          '1 Lowercase letter, \n' +
          '1 Uppercase letter, \n' +
          '1 Number, and \n' +
          '1 Symbol'
        ).isStrongPassword().isLength({min:8, max: 254}).trim().escape(),
        body(
          'clinic_id', 
          'Clinic ID must be made up of numeric characters and not contain +, -, or .'
        ).isNumeric({no_symbols: true}).trim().escape()
      ]   
    }
  }
}