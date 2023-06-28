const express = require('express')
const db = require('../../db/database')
const md5 = require('md5')
const dotenv = require('dotenv').config({path: '../../config/.env'})

const router = express.Router()

const bodyParser = require('body-parser')
const { authenticateToken, generateAccessToken } = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

router.get('/test', (req, res) => {
    res.send('users route test')
})

// list of all users
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

// gets a user with a specific id
router.get('/:id', (req, res) => {
    let query = "select * from user where user_id = ?"
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

// creates a user
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


// Login for user, returns json web token
router.post('/login', (req, res) => {
    let errors = []
    if (!req.body.password) {
        errors.push('Password required!')
    }
    if (!req.body.email) {
        errors.push('Email required!')
    }
    if (errors.length > 0) {
        res.status(400).json({"error": errors.join(',')})
        return
    }
    let data = {
        email: req.body.email,
        password: md5(req.body.password)
    }
    find_query = `SELECT * FROM user WHERE email = ?`
    db.get(find_query, [data.email], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row.password != data.password) {
            res.status(400).json({"error": "incorrect password"})
            return
        }
        const token = generateAccessToken({"username": row.user_id})
        res.json(token)
    })
})

// update user
router.patch('/', authenticateToken, (req, res) => {
    // TODO
})

module.exports = router