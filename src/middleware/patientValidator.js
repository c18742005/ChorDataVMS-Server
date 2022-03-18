/*
    JavaScript file that validates patient forms
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'validatePatientForm': {
      return [ 
        body(
          'patient_name', 
          'Name can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'patient_species', 
          'Species cannot be empty')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'patient_breed', 
          'Breed can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " -()"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'patient_age', 
          'Age cannot be empty and must be numeric')
          .exists().isNumeric().trim().escape(),
        body(
          'patient_sex', 
          'Sex cannot be empty')
          .exists().isAlpha().isLength({min:1, max: 3}).trim().escape(),
        body(
          'patient_color', 
          'Color cannot be empty and must only use alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " -"}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'patient_microchip', 
          'Microchip must be 15 characters long and must be numeric')
          .exists().isLength({min:15, max: 15}).isNumeric().trim().escape()
      ]   
    }
  }
}