const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())


// total votes for a post
router.get('/post/:post_id', (req, res) => {
    let query = `SELECT SUM(votes) FROM post WHERE post_id = ?`
})

// total votes for a comment
router.get('/comment/:comment_id', (req, res) => {

})

// internet points for a user
router.get('/user/:user_id', (req, res) => {

})

// update post votes
router.post('/post/:post_id', authenticateToken, (req, res) => {
    if (!req.body.value) {
        res.status(400).json({"error": "no value"})
        return
    }
    let exists_query = `SELECT * FROM post_vote WHERE user_id = (SELECT user_id FROM user WHERE email = ?), AND post_id = ?`
    let exists_params = [req.auth_token, req.params.post_id]
    db.get(exists_query, exists_params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row == undefined) {
            let create_query = `INSERT INTO post_vote (user_id, post_id, value) VALUES ((SELECT user_id FROM user WHERE email = ?), ?, ?)`
            let create_params = [req.auth_token, req.params.post_id, req.body.value]
            db.run(create_query, create_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    "message": "success",
                    "data": {
                        "user": req.auth_token,
                        "post_id": req.params.post_id,
                        "vote": req.body.vote
                    },
                    "id": this.lastID
                })
            })
        }
        else {
            let update_query = `UPDATE post_vote SET
                vote = COALESCE(?, vote) WHERE post_id = ? AND user_id = (SELECT user_id FROM user WHERE email = ?)`
            let update_params = [req.body.vote, req.params.post_id, req.auth_token]
            db.run(update_query, update_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    message: "success",
                    data: {
                        "user": req.auth_token,
                        "post_id": req.params.post_id,
                        "vote": req.body.vote
                    },
                    changes: this.changes
                })
            })
        }
    })
})

// update comment vote
router.post('/comment/:comment_id', authenticateToken, (req, res) => {
    if (!req.body.value) {
        res.status(400).json({"error": "no value"})
        return
    }
    let exists_query = `SELECT * FROM comment_vote WHERE user_id = (SELECT user_id FROM user WHERE email = ?), AND comment_id = ?`
    let exists_params = [req.auth_token, req.params.comment_id]
    db.get(exists_query, exists_params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row == undefined) {
            let create_query = `INSERT INTO comment_vote (user_id, comment_id, value) VALUES ((SELECT user_id FROM user WHERE email = ?), ?, ?)`
            let create_params = [req.auth_token, req.params.comment_id, req.body.value]
            db.run(create_query, create_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    "message": "success",
                    "data": {
                        "user": req.auth_token,
                        "comment_id": req.params.comment_id,
                        "vote": req.body.vote
                    },
                    "id": this.lastID
                })
            })
        }
        else {
            let update_query = `UPDATE comment_vote SET
                vote = COALESCE(?, vote) WHERE comment_id = ? AND user_id = (SELECT user_id FROM user WHERE email = ?)`
            let update_params = [req.body.vote, req.params.comment_id, req.auth_token]
            db.run(update_query, update_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    message: "success",
                    data: {
                        "user": req.auth_token,
                        "comment_id": req.params.comment_id,
                        "vote": req.body.vote
                    },
                    changes: this.changes
                })
            })
        }
    })
})

module.exports = router
