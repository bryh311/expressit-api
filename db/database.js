const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
// const md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // console.error(err.message)
        throw err
    }
    else {
        console.log('Connected to SQLite database')
        try {
            // load the schema.sql file
            const data = fs.readFileSync('./db/schema.sql', 'utf-8')
            // console.log(data.toString())
            db.exec(data, (err) => {
                if (err) {
                    // table created
                    console.error(err)
                }
                else {

                }
            })
        }
        catch (e) {
            console.error(e)
        }
    }
})

module.exports = db
