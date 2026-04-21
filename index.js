const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes for especialidades
app.get('/especialidades', (req, res) => {
    res.send('List of especialidades');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
