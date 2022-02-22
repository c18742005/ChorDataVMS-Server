const express = require('express');
const cors = require('cors');
const app = express();

const index = require('./routes/index');
const clientRoute = require('./routes/client.routes');
const patientRoute = require('./routes/patient.routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(cors());

app.use(index);
app.use('/api/', clientRoute);
app.use('/api/', patientRoute);

module.exports = app;