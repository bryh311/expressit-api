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

router.get('/:id', (req, res) => {
    let query = 'SELECT * FROM subgroup WHERE id = ?'
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

function id_from_email(email) {
    db.get('SELECT user_id FROM user WHERE email =?', email, (err, item) => {
        if (err) {
            return -1
        }
        console.log(item)
        return item.user_id
    })
}

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
