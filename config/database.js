const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'grupog',
    password: 'prog3',
    database: 'clinica_bd'
});

module.exports = pool;