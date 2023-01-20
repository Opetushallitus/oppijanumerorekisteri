const express = require('express');
const cors = require('cors');
const apiMocker = require('connect-api-mocker');

const port = 8080;
const app = express();

app.use(cors());
app.use('/', apiMocker('src/api'));
console.info(`Mock API Server is up and running at: http://localhost:${port}`);
app.listen(port);
