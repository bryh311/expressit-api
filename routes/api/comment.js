const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

// list of comments from a given post
router.get('/post/:post/', (req, res) => {
    let comments_query = `SELECT * FROM comment WHERE post_id = (SELECT post_id FROM post WHERE name = ?)`
    db.all(comments_query, req.params.post, (err, rows) => {
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

// gets a comment from its id
router.get('/:id', (req, res) => {
    let query = "SELECT * FROM comment WHERE comment_id = ?"
    db.get(query, req.params.id, (err, row) => {
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

router.post('post/:post/', authenticateToken, (req, res) => {
    let errors = []
    if (!req.body.content) {
        errors.push("lack of message content!")
    }
    
    if (errors.length > 0) {
        res.status(400).json({"error": errors.join(",")})
        return
    }

    let data = {
        creator: req.auth_token.username,
        post: req.params.post,
        content: req.body.content,
        votes: 0,
        date: Date.now
    }

    let create_query = `INSERT INTO comment (creator_id, post_id, content, votes, date) VALUES 
    ((SELECT user_id FROM user WHERE email =?), ?, ?, ?, ?)`

    let params = [data.creator, data.post, data.content, data.votes, data.date]

    db.run(create_query, params, function(err, result) {
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