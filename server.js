const dotenv = require('dotenv').config()
const app = require('./src/app');

console.log(`NODE_ENV=${process.env.NODE_ENV}`);

app.listen(process.env.PORT, () => {
    console.log(`APP LISTENING ON PORT: ${process.env.PORT}`);
})