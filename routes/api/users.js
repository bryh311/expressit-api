const express = require('express')
const db = require('../../db/database')
const md5 = require('md5')
const router = express.Router()

const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

router.get('/test', (req, res) => {
    res.send('users route test')
})

router.get('/', (req, res) => {
    let query = 'select * from user'
    let params = []
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message": "success",
            "data": rows
        })
    })
})

router.get('/:id', (req, res) => {
    let query = "select * from user where id = ?"
    let params = [req.params.id]
    db.get(query, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message":"success",
            "data": row
        })
    })
})

router.post('/', (req, res) => {
    let errors = []
    if (!req.body.password) {
        errors.push("No password specified")
    }
    if (!req.body.username) {
        errors.push("No username specified")
    }
    if (!req.body.email) {
        errors.push("No email specified")
    }

    if (errors.length > 0) {
        res.status(400).json({"error": errors.join(",")})
        return
    }

    let data = {
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password)
    }

    let query = 'INSERT INTO user (username, email, password) VALUES (?,?,?)'
    let params = [data.username, data.email, data.password]
    db.run(query, params, function(err, result) {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        })
    })
})



module.exports = router