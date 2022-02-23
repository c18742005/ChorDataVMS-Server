const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'createClient': {
      return [ 
        body(
          'client_forename', 
          'Forename can only consist of alphabetic characters')
          .exists().isAlpha().trim().escape(),
        body(
          'client_surname', 
          'Surname can only consist of alphabetic characters')
          .exists().isAlpha().trim().escape(),
        body(
          'client_address', 
          'Address cannot be empty')
          .exists().trim().escape(),
        body(
          'client_city', 
          'City cannot be empty')
          .exists().trim().escape(),
        body(
          'client_county', 
          'County cannot be empty and must only use alphanumeric characters')
          .exists().trim().escape(),
        body(
          'client_phone', 
          'Phone cannot be empty and must only use numeric characters')
          .exists().isNumeric().trim().escape(),
        body(
          'client_email', 
          'Email is invalid')
          .exists().isEmail().trim().escape().normalizeEmail()
      ]   
    }
  }
}