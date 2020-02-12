'use strict';
require ('dotenv').config();

// App Dependencies
const superagent = require('superagent');
const express = require('express');
const pg = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const client = new pg.Client(process.env.DATABASE_URL);


// Routes

// Display Error Messages via this route
app.get('/error', (request, response) => {
  response.render('pages/error.ejs');
});

// Homepage
app.get('/', (request, response) => {
  let SQL = `SELECT * FROM booklist;`;
  client.query(SQL)
    .then(result => {
      console.log(result.rows);
      response.render('pages/index.ejs', {books: result.rows});
    });


  // response.render('pages/index.ejs');
});

// Display New Search Form via this route
app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new.ejs');
});

// Display Search Results
app.post('/searches', createSearch);
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
//Save search Results
app.post('/books/show.ejs', saveSearch);
function saveSearch(request, response){
  let image_url = request.body.image_url;
  let title = request.body.title;
  let authors = request.body.authors;
  let isbn = request.body.isbn;
  let description = request.body.description;

  let SQL = 'INSERT INTO booklist(image_url, title, authors, isbn, description) VALUES ($1, $2, $3, $4, $5);';
  let VALUES = [image_url, title, authors, isbn, description];
  client.query(SQL, VALUES)
    .then(result =>{
      response.render('/', {books: result.rows[0]});
    })
    .catch(err => errorHandler(err, response));

}

// Helper Functions
function errorHandler(error, request, response) {
  response.render('pages/error.ejs');
}

// Book Object
function Book(show) {
  this.title = show.title;
  this.authors = show.authors ? show.authors.join(', ') : 'No authors!!';
  this.isbn = show.industryIdentifiers.type ? show.industryIdentifiers.type.join(' ') : 'No ISBN';
  this.image_url = `<img src="${show.imageLinks.smallThumbnail}">` || 'No Image';
  this.description = show.description || 'No Description';
}
client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`Server up on ${PORT}`));
  });
// .catch(err => {
//   console.error('pg connect error', err);
// })
