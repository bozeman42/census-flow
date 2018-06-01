const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();
// require('./modules/populate.database')();

const PORT = process.env.PORT;

app.use(express.static(`build`));

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));