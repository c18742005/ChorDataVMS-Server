const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv').config()

const index = require('./routes/index');
const clientRoute = require('./routes/client.routes');
const patientRoute = require('./routes/patient.routes');
const sidebarRoute = require('./routes/sidebar.routes');
const staffRoute = require('./routes/staff.routes');
const authenticationRoute = require('./routes/authentication.routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));

const origin = `${process.env.CORS_URL}`
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", origin);
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());

app.use(index);
app.use('/api/', clientRoute);
app.use('/api/', patientRoute);
app.use('/api/', sidebarRoute);
app.use('/api/', staffRoute);
app.use('/api/', authenticationRoute);

module.exports = app;