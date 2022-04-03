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
          .exists().isNumeric({no_symbols: true}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'drug_quantity', 
          'Drug quantity must be numeric and be between 0.01 and 999.99')
          .exists().isFloat({ min: 0.01, max: 999.99 }).trim().escape(),
        body(
          'drug_concentration', 
          'Drug concentration cannot be empty')
          .exists().isLength({min:1, max: 254}).trim()
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
          .exists().isNumeric({no_symbols: true}).isLength({min:1, max: 254}).trim().escape(),
        body(
          'drug_quantity_given', 
          'Drug quantity must be alphanumeric and cannot be empty')
          .exists().isFloat({ min: 0.01, max: 999.99 }).trim().escape()
      ]   
    }
  }
}