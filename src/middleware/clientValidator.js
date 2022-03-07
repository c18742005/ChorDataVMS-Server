/*
    JavaScript file that validates client forms
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'validateClientForm': {
      return [ 
        body(
          'client_forename', 
          'Forename can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'client_surname', 
          'Surname can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'client_address', 
          'Address cannot be empty and must be alphanumeric')
          .exists().isAlphanumeric("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'client_city', 
          'City cannot be empty and must be alphabetic')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'client_county', 
          'County cannot be empty and must only use alphanumeric characters')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'client_phone', 
          'Phone must be a valid phone number and must only use numeric characters (No spaces)')
          .exists().isMobilePhone().isLength({min:1, max: 254}).trim().escape(),
        body(
          'client_email', 
          'Email is invalid')
          .exists().isEmail().trim().escape().normalizeEmail()
      ]   
    }
  }
}