/*
    JavaScript file that validates dental form
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'validateToothForm': {
      return [ 
        body(
          'tooth_problem', 
          'Problem can only consist of alphabetic characters')
          .exists().isAlpha("en-GB", {ignore: " "}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'tooth_note', 
          'Notes can only consist of alphanumeric characters')
          .optional({checkFalsy: true}).isLength({min:1, max: 1023}).trim()
      ]   
    }
  }
}