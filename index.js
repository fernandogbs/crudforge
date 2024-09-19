const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const dataFile = path.join(__dirname, 'cruds.json');

// Set up Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load CRUD data from file
function loadData() {
    if (!fs.existsSync(dataFile)) {
        return {};
    }
    const rawData = fs.readFileSync(dataFile);
    return JSON.parse(rawData);
}

// Save CRUD data to file
function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Serve the main page
app.get('/', (req, res) => {
    const data = loadData();
    res.render('index', { cruds: Object.keys(data) });
});

// Display CRUD items
app.get('/crud/:name', (req, res) => {
    const { name } = req.params;
    const data = loadData();
    const crud = data[name];

    if (!crud) {
        return res.status(404).send('CRUD not found');
    }

    res.render('crud', { name, items: crud.items });
});

// Create a new CRUD
app.post('/cruds', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send('Name is required');
    }

    const data = loadData();
    if (data[name]) {
        return res.status(400).send('CRUD already exists');
    }

    data[name] = { items: {} };
    saveData(data);
    res.redirect('/');
});

// Create an item
app.post('/crud/:name/items', (req, res) => {
    const { name } = req.params;
    const { id, col1, col2, col3, col4 } = req.body;

    if (!id || !col1 || !col2 || !col3 || !col4) {
        return res.status(400).send('ID and all 4 columns are required');
    }

    const data = loadData();
    const crud = data[name];
    if (!crud) {
        return res.status(404).send('CRUD not found');
    }

    crud.items[id] = { col1, col2, col3, col4 };
    saveData(data);
    res.redirect(`/crud/${name}`);
});

// Update an item
app.post('/crud/:name/items/:id/update', (req, res) => {
    const { name, id } = req.params;
    const { col1, col2, col3, col4 } = req.body;

    if (!col1 || !col2 || !col3 || !col4) {
        return res.status(400).send('All 4 columns are required');
    }

    const data = loadData();
    const crud = data[name];
    if (!crud || !crud.items[id]) {
        return res.status(404).send('Item not found');
    }

    crud.items[id] = { col1, col2, col3, col4 };
    saveData(data);
    res.redirect(`/crud/${name}`);
});

// Delete an item
app.post('/crud/:name/items/:id/delete', (req, res) => {
    const { name, id } = req.params;

    const data = loadData();
    const crud = data[name];
    if (!crud || !crud.items[id]) {
        return res.status(404).send('Item not found');
    }

    delete crud.items[id];
    saveData(data);
    res.redirect(`/crud/${name}`);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
