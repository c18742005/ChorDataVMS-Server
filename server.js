const dotenv = require('dotenv').config()
const app = require('./src/app');

app.listen(process.env.PORT, () => {
    console.log(`APP LISTENING ON PORT: ${process.env.PORT}`);
})