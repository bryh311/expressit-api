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

// test authentication
router.get('/authtest', authenticateToken, (req, res) => {
    console.log(req)
    res.json(req.auth_token)
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

    let query = 'INSERT INTO user (username, email, password, is_website_admin, internet_points) VALUES (?,?,?,?,?)'
    let params = [data.username, data.email, data.password, false, 0]
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
        const token = generateAccessToken({"username": row.email})
        res.json({"access_token": token})
    })
})

router.patch('/update/:id', authenticateToken, (req, res) => {
    let data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password ? md5(req.body.password) : null
    }
    const auth_email = req.auth_token.username
    const select_query = `SELECT * FROM user WHERE id = ?`
    db.get(select_query, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row.email != auth_email) {
            res.status(401).json({"error": "access denied"})
            return
        }

        const update_query = `UPDATE user SET
            username = COALESCE(?,username),
            email = COALESCE(?,email),
            password = COALESCE(?,password)
            WHERE id = ?`
        
        db.run(update_query, [data.username, data.email, data.password], function(err, result) {
            if (err) {
                res.status(400).json({"error": err.message})
                return
            }
            let return_json = {
                message: "success",
                data: data,
                changes: this.changes
            }
            if (this.changes.email != null) {
                return_json.auth_token = generateAccessToken(changes.email)
            }
            res.json(return_json)
        })
    })
})

router.delete('/delete/:id', authenticateToken, (req, res) => {
    const auth_email = req.auth_token.username
    const select_query = `SELECT * FROM USER WHERE id = ?`
    db.get(select_query, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row.email != auth_email) {
            res.status(401).json({"error": "access denied"})
            return
        }
        db.run(`DELETE FROM user WHERE id = ?`, [req.params.id], function(err, result) {
            if (err) {
                res.status(400).json({"error": res.message})
                return
            }
            res.json({"message": "deleted", "changes": this.changes})
        })
    })
})

module.exports = router