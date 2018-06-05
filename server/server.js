const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();
const testRouter = require('./routes/test-route');
// require('./modules/populate.database')();

const PORT = process.env.API_PORT;

app.use(express.static(`build`));
app.use('/api',testRouter)

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));