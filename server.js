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
// Test Route
app.get('/test', (request, response) => {
  response.send('is working');
});

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

// Display List of 10 Books via this route
// app.get('/searches', (request, response) => {
//   response.render('pages/searches/show.ejs');
// });


// app.get('/searches', (request, response) => {
//   console.log(request.query);
//   response.status(200).send('GET');
// });

app.post('/searches', (request, response) => {
  try{
    console.log('body', request.body);
    let title = request.body.title || 'this book';
    // let author = request.body.author || 'this author';
    let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
    console.log(url);

    superagent.get(url)
      .then(data => {
        console.log(data.body.items);
        const show = data.body.items.map(show => new Book(show.volumeInfo));
        response.render('pages/searches/show', {books: show});
        
        console.log('show', show);
        // response.send(200).json(show);
      });
  }
  catch(error){

    errorHandler('something went wrong', request, response);

  }
});

function errorHandler(error, request, response) {
  response.render('pages/error.ejs');
}
// Book Object
function Book(show) {
  this.title = show.title;
  this.authors = show.authors || ['No authors!!'];
}


app.listen(PORT, () => console.log(`server up on Port ${PORT}`));
