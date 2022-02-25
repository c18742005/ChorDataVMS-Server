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

const origin = `${process.env.CORS_URL}`

app.use(cors({
  origin: true, 
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.options('*', cors())
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));

app.use(index);
app.use('/api/', clientRoute);
app.use('/api/', patientRoute);
app.use('/api/', sidebarRoute);
app.use('/api/', staffRoute);
app.use('/api/', authenticationRoute);

module.exports = app;