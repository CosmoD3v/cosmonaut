const sqlite3 = require('sqlite3').verbose()
const path = require('path');

// Connect to DB
let DATABASE_LOCATION = path.join(__dirname, '..', 'databases', 'cosmonaut.db');
const database = new sqlite3.Database(DATABASE_LOCATION, sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
})

// Create Table
async function createTable(schema) {
    let query = `CREATE TABLE IF NOT EXISTS ${schema}`;
    database.run(query);
}

// Drop Table
async function dropTable(schema) {
    let table = schema.split("(")[0];
    let query = `DROP TABLE IF EXISTS ${table}`;
    database.run(query);
}

// Insert a record into a Table
async function insert(schema, data) {
    let values = '(' + (new Array(data.length).fill('?').join(',')) + ')';
    let query = `INSERT INTO ${schema} VALUES ${values}`;
    let response = new Promise(function (resolve) {
        database.run(query, data, ( err ) => {
            if ( err ) resolve( err.code );
            else resolve(null);
        });
    })
    return (await response)
}

// Delete records from a table where field matches a value
async function remove(schema, wherefield, value) {
    let table = schema.split("(")[0]
    let query = `DELETE FROM ${table} WHERE ${wherefield} = ?`
    let response = new Promise(function (resolve) {
        database.run(query, [value], (err) => {
            if ( err ) resolve( err.code );
            else resolve(null);
        })
    })
    return (await response)
}

// Select fields from a record in a table where field matches a value
async function select(schema, fields, wherefield, value) {
    let table = schema.split("(")[0]
    let query = `SELECT ${fields} FROM ${table} WHERE ${wherefield} = ?`
    let response = new Promise(function (resolve) {
        database.all(query, [value], (err, rows) => {
            if ( err ) resolve( err.code );
            else resolve(rows);
        })
    })
    return (await response)
}

// Select fields from multiple records in a particular order where fields match values specified
async function selectAndOrder(schema, fields, wherefields, values, order) {
    let table = schema.split("(")[0]
    let whereList = []
    wherefields.forEach(field => {
        whereList.push(`${field} = ?`)
    });
    let whereClause = whereList.join(' OR ')
    
    let query = `SELECT ${fields} FROM ${table} WHERE ${whereClause} ORDER BY ${order}`
    let response = new Promise(function (resolve) {
        database.all(query, values, (err, rows) => {
            if ( err ) resolve( err.code );
            else resolve(rows);
        })
    })
    return (await response)
}

// Check if a record exists in a table
async function exists(schema, field, value) {
    let table = schema.split("(")[0]
    let query = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${field} = ?)`
    let response = new Promise(function (resolve) {
        database.get(query, [value], (err, row) => {
            if ( err ) resolve( err.code );
            else resolve(row);
        });
    })
    let hasRecord = Object.values(await response)[0] == 1 ? true : false
    return (hasRecord)
}

// Update a field in a table where a field matches a value
async function update(schema, field, value, whereField, whereValue) {
    let table = schema.split("(")[0]
    let query = `UPDATE ${table} SET ${field} = ? WHERE ${whereField} = ?`
    let response = new Promise(function (resolve) {
        database.run(query, [value, whereValue], (err) => {
            if ( err ) resolve( err.code );
            else resolve(null);
        });
    })
    return (await response)
}

module.exports = {
    createTable,
    dropTable,
    insert,
    select,
    selectAndOrder,
    exists,
    remove,
    update,
}