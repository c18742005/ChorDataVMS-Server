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
const drugRoute = require('./routes/drug.routes');
const xrayRoute = require('./routes/xray.routes');

const origin = `${process.env.CORS_URL}`

app.use(cors({
  origin: origin, 
  methods: ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));

app.use(index);
app.use('/api/', clientRoute);
app.use('/api/', patientRoute);
app.use('/api/', sidebarRoute);
app.use('/api/', staffRoute);
app.use('/api/', authenticationRoute);
app.use('/api/', drugRoute);
app.use('/api/', xrayRoute);

module.exports = app;