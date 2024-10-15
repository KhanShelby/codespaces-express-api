const express = require('express');
const bodyParser = require('body-parser');
var mysql = require('mysql');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use(express.json());

var con = mysql.createConnection({
  host: 'korawit.ddns.net',
  user: 'webapp',
  password: 'secret2024',
  port: '3307',
  database: 'shop'
});

// Handle MySQL connection errors
con.connect(function (err) {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/api/products', function (req, res) {
  con.query('SELECT * FROM products', function (err, result, fields) {
    if (err) {
      console.error('Database error:', err);  // Log detailed error
      return res.status(500).send('Error fetching products');
    }
    console.log(result);
    res.send(result);
  });
});


// GET product by ID
app.get('/api/products/:id', function (req, res) {
  const id = req.params.id;

  con.query('SELECT * FROM products WHERE id = ?', [id], function (err, result, fields) {
    if (err) {
      console.error('Database error:', err);  // Log detailed error
      return res.status(500).send('Error fetching product');
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.status(404).send('Product not found for ID ' + id);
    }
  });
});


// DELETE product by ID
app.delete('/api/products/:id', function (req, res) {
  const id = req.params.id;

  con.query('DELETE FROM products WHERE id = ?', [id], function (err, result, fields) {
    if (err) {
      console.error('Database error:', err);  // Log detailed error
      return res.status(500).send('Error deleting product');
    }

    // Fetch updated list of products after deletion
    con.query('SELECT * FROM products', function (err, result, fields) {
      if (err) {
        console.error('Database error:', err);  // Log detailed error
        return res.status(500).send('Error fetching products after deletion');
      }
      res.send(result);
    });
  });
});


// PUT update product by ID
app.put('/api/products/:id', function (req, res) {
  const id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;

  const sql = 'UPDATE products SET name = ?, price = ? WHERE id = ?';

  con.query(sql, [name, price, id], function (err, result) {
    if (err) {
      console.error('Database error:', err);  // Log detailed error
      return res.status(400).send('Error updating product');
    }

    // Fetch updated list of products after update
    con.query('SELECT * FROM products', function (err, result, fields) {
      if (err) {
        console.error('Database error:', err);  // Log detailed error
        return res.status(500).send('Error fetching products after update');
      }
      res.send(result);
    });
  });
});

//Start Server
const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log('Listening on port', port);
});
