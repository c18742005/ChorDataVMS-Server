const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'loginStaffMember': {
      return [ 
        body('username', 'Username must have a value').exists().trim().escape(),
        body(
          'password', 
          'Password is too weak. Password should contain at least: ' +
          '1 Lowercase letter, ' +
          '1 Uppercase letter, ' +
          '1 Number, and ' +
          '1 Symbol'
        ).isStrongPassword().trim().escape()
      ]   
    }
    case 'registerStaffMember': {
      return [ 
        body('username', 'Username must have a value').exists().trim().escape(),
        body(
          'password', 
          'Password is too weak. Password should contain at least: ' +
          '1 Lowercase letter, ' +
          '1 Uppercase letter, ' +
          '1 Number, and ' +
          '1 Symbol'
        ).isStrongPassword().trim().escape(),
        body(
          'role', 
          'Role must be one of: Vet, Nurse, ACA, Receptionist')
            .isIn(["Vet", "Nurse", "ACA", "Receptionist"]).trim().escape(),
        body(
          'clinic_id', 
          'Clinic ID must be made up of numeric characters and not contain +, -, or .')
          .isNumeric({no_symbols: true}).trim().escape()
      ]   
    }
  }
}