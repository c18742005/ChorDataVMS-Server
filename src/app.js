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

app.use(cors({
  origin: true, 
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
  headers: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(index);
app.use('/api/', clientRoute);
app.use('/api/', patientRoute);
app.use('/api/', sidebarRoute);
app.use('/api/', staffRoute);
app.use('/api/', authenticationRoute);

module.exports = app;