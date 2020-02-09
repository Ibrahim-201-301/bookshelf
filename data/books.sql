DROP TABLE IF EXISTS booklist;
CREATE TABLE booklist(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description VARCHAR(255),
  bookshelf VARCHAR(255)
)

