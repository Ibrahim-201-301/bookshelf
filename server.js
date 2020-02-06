'use strict';
require ('dotenv').config();

// App Dependencies

const superagent = require('superagent');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/test', (request, response) => {
  response.send('is working');
});

app.get('/', (request, response) => {
  response.render('pages/index.ejs');
});

app.listen(PORT, () => console.log(`server up on Port ${PORT}`));
