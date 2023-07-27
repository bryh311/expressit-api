const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

// list of comments from a given post
router.get('/post/:post/', (req, res) => {
    let comments_query = `SELECT * FROM comment WHERE post_id = ?`
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

router.patch('/update/:id', authenticateToken, (req, res) => {
    let data = {
        content: req.body.content,
    }
    let edit_query = `UPDATE comment SET
        content = COALESCE(?, content),
        edited = true
        WHERE comment_id = ? AND creator_id = (SELECT user_id FROM user WHERE email = ?)`
    
    db.run(edit_query, [req.params.id, req.auth_token.username], function(err, result) {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        let return_json = {
            message: "success",
            data: data,
            changes: this.changes
        }
        res.json(return_json)
    })
})

router.delete('/delete/:id', authenticateToken, (req, res) => {
    let delete_query = "DELETE FROM comment WHERE comment_id = ?"
    db.run(delete_query, req.params.id, function(err, result) {
        if (err) {
            res.status(400).json({"error": res.message})
            return
        }
        res.json({"message": "deleted", "changes": this.changes})
    })
})

module.exports = router