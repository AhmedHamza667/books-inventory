const express = require('express');
const app = express();
const port = 4000;
//const books = require('./books');
require('dotenv').config();
const { query } = require('./database');


app.use((req, res, next) => {
    res.on("finish", () => {
      // the 'finish' event will be emitted when the response is handed over to the OS
      console.log(`Request: ${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
  });
  app.use(express.json());
  
app.get("/", (req, res) => {
    res.send("Welcome to the Books API!!!!");
  });


app.get("/books", async (req, res) => {
  try {
    const allBooks = await query("SELECT * FROM books");
    res.status(200).json(allBooks.rows);
  } catch (err) {
    console.error(err);
  }
});

app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  try {
    const book = await query("SELECT * FROM books WHERE id = $1", [bookId]);

    if (book.rows.length > 0) {
      res.status(200).json(book.rows[0]);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
  }
});

app.post("/books", async (req, res) => {
  const { id, title, author, publishdate } = req.body;

  try {
    const newBook = await query(
      "INSERT INTO books (id, title, author, publishdate) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, title, author, publishdate]
    );

    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.patch("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  const { id, title, author, publishdate } = req.body;

  try {
    const updatedBook = await query(
      "UPDATE books SET id = $1, title = $2, author = $3, publishdate = $4 WHERE id = $5 RETURNING *",
      [bookId, title, author, publishdate, bookId]
    );

    if (updatedBook.rows.length > 0) {
      res.status(200).json(updatedBook.rows[0]);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
  }
});


app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  try {
    const deleteOp = await query("DELETE FROM books WHERE id = $1", [bookId])

    if (deleteOp.rowCount > 0) {
      res.status(200).send({ message: "Book deleted" });
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
      console.error(err);
    }
  });

  
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });