const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const Bluebird = require('bluebird');
const cors = require('cors');

// using fetch
fetch.Promise = Bluebird;

// routes
const album = require('./routes/api/album');

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// body input
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use routes
app.use('/api/album', album);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
