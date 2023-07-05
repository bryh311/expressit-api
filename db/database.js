const sqlite3 = require('sqlite3').verbose()
const md5 = require('md5')
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
            const data = fs.readFileSync('./db/schema.sql', 'utf-8').toString()
            const queries = data.split(';')
            // console.log(queries)
            db.serialize(() => {
                queries.forEach(query => {
                    if (query != '') {
                        query += ';'
                        db.run(query, err => {
                            if (err) {
                                // this means that the table has already been created
                                //console.log(query)
                                //console.error(err.message)
                            }
                        })
                    }
                })
            })
            db.get(`select * from user where email = ?`, ["admin@expressit.com"], (err, row) => {
                // console.log(`row ${row}`)
                if (row == undefined) {
                    let params = ['admin', 'admin@expressit.com', md5('12345'), true, 0]
                    db.run(`INSERT INTO user 
                        (username, email, password, is_website_admin, internet_points)
                        VALUES (?, ?, ?, ?, ?)`, params)
                }
            })
        }
        catch (e) {
            console.error(e)
        }
    }
})

module.exports = db
