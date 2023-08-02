const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

router.get('/', (req, res) => {
    let query = 'SELECT * FROM subgroup'
    db.all(query, [], (err, rows) => {
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

router.get('/group/:name', (req, res) => {
    let query = 'SELECT * FROM subgroup WHERE name = ?'
    let params = [req.params.name]
    db.get(query, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message": "success",
            "data": row
        })
    })
})

router.get('/:id', (req, res) => {
    let query = 'SELECT * FROM subgroup WHERE group_id = ?'
    let params = [req.params.id]
    db.get(query, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message": "success",
            "data": row
        })
    })
})

router.post('/search', (req, res) => {
    if (!req.body.query) {
        res.status(400).json({"error": "no query included!"})
        return
    }
    const search = "%" + req.body.query.trim() + "%"
    const search_query = `SELECT * FROM subgroup WHERE name LIKE ?`
    db.all(search_query, search, (err, rows) => {
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

router.post("/subscribe/:name", authenticateToken, (req, res) => {
    let subscription_query = `INSERT INTO subscription (user_id, group_id, is_moderator) VALUES
        ((SELECT user_id FROM user WHERE email=?),(SELECT group_id FROM subgroup WHERE name=?), ?)`
    let subscription_params = [req.auth_token.username, req.params.name, false]
    db.run(subscription_query, subscription_params, (err, result) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
    })

    let add_user_query = `UPDATE subgroup SET user_count = user_count + 1 WHERE name = ?`
    let add_params = [req.params.name]
    db.run(add_user_query, add_params, (err, result) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }

        res.json({
            "message": "success"
        })
    })
})

router.post('/unsubscribe/:name', authenticateToken, (req, res) => {
    let unsubscription_query = `DELETE FROM subscription WHERE
        user_id = (SELECT user_id FROM user WHERE email = ?), group_id = (SELECT group_id FROM subgroup WHERE name = ?)`
    let unsubscription_params = [req.auth_token.username, req.params.name]
    db.run(unsubscription_query, unsubscription_params, (err, result) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
    })
    let remove_user_query = `UPDATE subgroup SET user_count = user_count - 1 WHERE name = ?`
    let remove_params = [req.params.name]
    db.run(remove_user_query, remove_params, (err, result) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }

        res.json({
            "message": "success"
        })
    })
})

router.post('/', authenticateToken, (req, res) => {
    if (!req.body.name) {
        res.status(400).json({"error": "no name specified"})
        return
    }

    let create_query = "INSERT INTO subgroup (name, member_count) VALUES (?, ?)"
    db.run(create_query, [req.body.name, 0], function(err, result) {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        // let user_id = id_from_email(req.auth_token.username)
        // TODO: fix insert statment
        let add_user_query = `INSERT INTO subscription (user_id, group_id, is_moderator) VALUES 
            ((SELECT user_id FROM user WHERE email=?), ?, ?)`
        let local_id = this.lastID
        let subscription_params = [req.auth_token.username, this.lastID, true]
        console.log(subscription_params)
        db.run(add_user_query, subscription_params, (err, result) => {
            if (err) {
                res.status(400).json({"error": err.message})
                return
            }
            res.json({
                "message": "success",
                "data": {
                    "name": req.body.name
                },
                "id": local_id
            })
        })
    })  
})

module.exports = router
