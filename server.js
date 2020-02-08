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

// Display Error Messages via this route
app.get('/error', (request, response) => {
  response.render('pages/error.ejs');
});

// Homepage
app.get('/', (request, response) => {
  response.render('pages/index.ejs');
});

// Display New Search Form via this route
app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new.ejs');
});

// Display Search Results
app.post('/searches', createSearch);

// Filter Results by Title or Author, Populate Search Results
function createSearch(request, response) {
  try {
    let url = `https://www.googleapis.com/books/v1/volumes?q=`;
    console.log(request.body);
    if (request.body.titleauth === 'title') {
      url += `+intitle:${request.body.search}`;
    } else {
      url += `+inauthor:${request.body.search}`;
    }
    console.log(url);
    superagent.get(url)
      .then(data => {
        const show = data.body.items.map(show => new Book(show.volumeInfo));
        response.render('pages/searches/show', {books: show});
      });
  }
  catch(error){
    errorHandler('something went wrong', request, response);
  }
}

// Helper Functions
function errorHandler(error, request, response) {
  response.render('pages/error.ejs');
}

// Book Object
function Book(show) {
  this.title = show.title;
  this.authors = show.authors || ['No authors!!'];
}

app.listen(PORT, () => console.log(`server up on Port ${PORT}`));
