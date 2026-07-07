const connectToMongo = require('./db');
const express = require('express');
const { query } = require('express-validator');

connectToMongo();

const app = express();
const port = 5000;

app.use(express.json()); // to use req, res. agar json se thunderclient se bhej rhe hai tab ye add krna pdta hai

app.get('/hello', query('person').notEmpty(), (req, res) => {
  res.send(`Hello, ${req.query.person}!`);
});

//Availabke routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`)
})
