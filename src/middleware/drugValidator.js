/*
    JavaScript file that validates drug forms
*/
const { body } = require('express-validator')

exports.validate = (method) => {
  switch (method) {
    case 'validateStockForm': {
      return [ 
        body(
          'drug_expiry_date', 
          'Must be a date format')
          .exists().isISO8601().trim(),
        body(
          'drug_batch_id', 
          'Batch number must be numerical and cannot be empty')
          .exists().isNumeric().isLength({min:1, max: 254}).trim().escape(),
        body(
          'drug_quantity', 
          'Drug quantity must be numeric and cannot be empty')
          .exists().isNumeric().isLength({min:1, max: 254}).trim(),
        body(
          'drug_concentration', 
          'Drug concentration must be alphanumeric and cannot be empty')
          .exists().isAlphanumeric("en-GB", {ignore: " -/"}).isLength({min:1, max: 254}).trim()
      ]   
    }
    case 'validateDrugGiven': {
      return [ 
        body(
          'drug_date_given', 
          'Must be a date format')
          .exists().isISO8601().trim(),
        body(
          'drug_log_drug_stock_id', 
          'Batch number must be numerical and cannot be empty')
          .exists().isNumeric().isLength({min:1, max: 254}).trim().escape(),
        body(
          'drug_quantity_given', 
          'Drug quantity must be alphanumeric and cannot be empty')
          .exists().isNumeric().isLength({min:1, max: 254}).trim()
      ]   
    }
  }
}