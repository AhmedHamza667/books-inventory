const express = require('express');
const app = express();
const port = 4000;
const books = require('./books');
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

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });