'use strict';
require ('dotenv').config();

// App Dependencies
const superagent = require('superagent');
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const client = new pg.Client(process.env.DATABASE_URL);


// Routes //

// Homepage
app.get('/', displayDataOnIndex);

// Display New Search Form via this route
app.get('/searches/new', (request, response) => {
  response.render('pages/searches/new.ejs');
});

// Display Search Results
app.post('/searches', createSearch);

// Save book to Database from list of Search Results
app.post('/', saveSearch);

// Display detailed view of any saved book
app.get('/books/:id', bookDetail);

//Delete book from database
app.delete('/books/:id', removeBook);

// Display Error Messages via this route
app.get('/error', (request, response) => {
  response.render('pages/error.ejs');
});

// Displays book detail view after user updates details
app.put('/books/:id', editBook);

// Allows the user to update book details, saves changes to database and repopulates book detail view
function editBook(request, response) {
  let id = request.params.id;
  let title = request.body.title;
  let authors = request.body.authors;
  let description = request.body.description;

  let SQL = `UPDATE booklist SET title=$1, authors=$2, description=$3 WHERE id = $4;`;
  let values = [title, authors, description, id];

  client.query(SQL, values)
    .then(() => {
      response.redirect(`/books/${id}`);
    })
    .catch(error => errorHandler(error, request, response));
}

// Displays all books saved to database
function displayDataOnIndex (request, response){
  let SQL = `SELECT * FROM booklist;`;
  client.query(SQL)
    .then(result => {
      console.log(result.rows[0]);
      response.render('pages/index.ejs', {books: result.rows});
    });
}

// Allows user to search for books by title or author
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

// Allows the user to save book to Database from list of Search Results
function saveSearch(request, response){
  let image_url = request.body.image_url;
  let title = request.body.title;
  let authors = request.body.authors;
  let isbn = request.body.isbn;
  let description = request.body.description;

  let SQL = `INSERT INTO booklist (image_url, title, authors, isbn, description) VALUES ($1, $2, $3, $4, $5);`;
  let VALUES = [image_url, title, authors, isbn, description.slice(0, 255)];

  client.query(SQL, VALUES);
  client.query(`SELECT * FROM booklist`)
    .then(result => {
      response.render('pages/index.ejs', {books: result.rows});
    })
    .catch(error => errorHandler(error, request, response));
}

// Allows user to display details for single book from database
function bookDetail(request, response){
  let SQL = `SELECT * FROM booklist WHERE id = $1;`;
  let VALUES = [request.params.id];
  client.query(SQL, VALUES)
    .then(result => {
      response.render('./pages/books/detail.ejs', {books: result.rows[0]});
    })
    .catch(error => errorHandler(error, request, response));
}

// Allows the user to remove a book from the database
function removeBook(request, response) {
  let id = request.params.id;
  let SQL = `DELETE FROM booklist WHERE id = $1;`;
  let values = [id];

  client.query(SQL, values)
    .then (() => {
      response.redirect('/');
    })
    .catch(error => errorHandler(error, request, response));
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

