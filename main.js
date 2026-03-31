// Import required modules
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

// Create an Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB configuration
const MONGO_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'SNIST';

// Connect to MongoDB and define routes only after connection
MongoClient.connect(MONGO_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(DATABASE_NAME);

    // Routes

    // Home route to list all items
    app.get('/', async (req, res) => {
      try {
        const items = await db.collection('items').find().toArray();
        res.render('index', { items });
      } catch (error) {
        res.status(500).send('Error fetching items');
      }
    });

    // Form to create a new item
    app.get('/create', (req, res) => {
      res.render('create');
    });

    // Create a new item
    app.post('/create', async (req, res) => {
      try {
        await db.collection('items').insertOne({
          name: req.body.name,
          description: req.body.description
        });
        res.redirect('/');
      } catch (error) {
        res.status(500).send('Error creating item');
      }
    });

    // Form to edit an item
    app.get('/edit/:id', async (req, res) => {
      try {
        const item = await db.collection('items').findOne({
          _id: new ObjectId(req.params.id)
        });
        res.render('edit', { item });
      } catch (error) {
        res.status(500).send('Error fetching item');
      }
    });

    // Update an item
    app.post('/edit/:id', async (req, res) => {
      try {
        await db.collection('items').updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              name: req.body.name,
              description: req.body.description
            }
          }
        );
        res.redirect('/');
      } catch (error) {
        res.status(500).send('Error updating item');
      }
    });

    // Delete an item
    app.post('/delete/:id', async (req, res) => {
      try {
        await db.collection('items').deleteOne({
          _id: new ObjectId(req.params.id)
        });
        res.redirect('/');
      } catch (error) {
        res.status(500).send('Error deleting item');
      }
    });

    // Start the server only after DB is ready
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));
