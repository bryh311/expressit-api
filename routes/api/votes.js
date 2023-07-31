const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())


// total votes for a post
router.get('/post/:post_id', (req, res) => {
    let query = `SELECT SUM(value) FROM post_vote WHERE post_id = ?`
    db.get(query, req.params.post_id, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row["SUM(value)"] == undefined) {
            res.json({count: 0})
            return
        }
        res.json({count: row["SUM(value)"]})
    })
})

// total votes for a comment
router.get('/comment/:comment_id', (req, res) => {
    let query = `SELECT SUM(value) FROM comment_vote WHERE comment_id = ?`
    db.get(query, req.params.comment_id, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row['SUM(value)'] == undefined) {
            res.json({count: 0})
            return
        }
        res.json({count: row["SUM(value)"]})
    })
})

// check if exists from a user and gives value
router.get('/user/post/:post_id', authenticateToken, (req, res) => {
    let query = `SELECT * FROM post_vote WHERE user_id = (SELECT user_id FROM user WHERE email = ?) AND post_id = ?`
    let params = [req.auth_token.username, req.params.post_id]
    db.get(query, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row == undefined) {
            res.json({count: 0})
            return
        }
        res.json({count: row.value})
        
    })
})

// same as above but for comments
router.get('/user/comment/:comment_id', authenticateToken, (req, res) => {
    let query = `SELECT * FROM comment_vote WHERE user_id = (SELECT user_id FROM user WHERE email = ?) AND comment_id = ?`
    let params = [req.auth_token.username, req.params.comment_id]
    db.get(query, params, (err, row) => {
        if (err) {
            res.status(400).json({error: err.message})
            return
        }
        if (row == undefined) {
            res.json({count: 0})
            return
        }
        res.json({count: row.value})
    })
})

// internet points for a user
router.get('/user/:user_id', (req, res) => {
    let query1 = `SELECT SUM(value) FROM post_vote WHERE user_id = ?`
    let query2 = `SELECT SUM(value) FROM comment_vote WHERE user_id = ?`
    db.get(query1, req.params.user_id, (err, row1) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row1['SUM(value)'] == undefined) {
            row1 = {"SUM(value)": 0}
        }
        db.get(query2, req.params.user_id, (err, row2) => {
            if (err) {
                res.status(400).json({"error": err.message})
                return
            }
            if (row2["SUM(value)"] == undefined) {
                row2 = {"SUM(value)": 0}
            }
            res.json({count: row1["SUM(value)"] + row2["SUM(value)"]})
        })
    })
})

// update post votes
router.post('/post/:post_id', authenticateToken, (req, res) => {
    if (!req.body.value) {
        res.status(400).json({"error": "no value"})
        return
    }
    // req.body.value = parseInt(req.body.value)
    // console.log(req.body.value)
    let exists_query = `SELECT * FROM post_vote WHERE user_id = (SELECT user_id FROM user WHERE email = ?) AND post_id = ?`
    let exists_params = [req.auth_token.username, req.params.post_id]
    db.get(exists_query, exists_params, (err, row) => {
        console.log(err)
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row == undefined) {
            let create_query = `INSERT INTO post_vote (user_id, post_id, value) VALUES ((SELECT user_id FROM user WHERE email = ?), ?, ?)`
            let create_params = [req.auth_token.username, req.params.post_id, req.body.value]
            db.run(create_query, create_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    "message": "success",
                    "data": {
                        "user": req.auth_token.username,
                        "post_id": req.params.post_id,
                        "value": req.body.value
                    },
                    "id": this.lastID
                })
            })
        }
        else {
            let update_query = `UPDATE post_vote SET
                value = COALESCE(?, value) WHERE post_id = ? AND user_id = (SELECT user_id FROM user WHERE email = ?)`
            let update_params = [req.body.value, req.params.post_id, req.auth_token.username]
            db.run(update_query, update_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    message: "success",
                    data: {
                        "user": req.auth_token.username,
                        "post_id": req.params.post_id,
                        "value": req.body.value
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
    let exists_query = `SELECT * FROM comment_vote WHERE user_id = (SELECT user_id FROM user WHERE email = ?) AND comment_id = ?`
    let exists_params = [req.auth_token.username, req.params.comment_id]
    db.get(exists_query, exists_params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        if (row == undefined) {
            let create_query = `INSERT INTO comment_vote (user_id, comment_id, value) VALUES ((SELECT user_id FROM user WHERE email = ?), ?, ?)`
            let create_params = [req.auth_token.username, req.params.comment_id, req.body.value]
            db.run(create_query, create_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    "message": "success",
                    "data": {
                        "user": req.auth_token.username,
                        "comment_id": req.params.comment_id,
                        "value": req.body.value
                    },
                    "id": this.lastID
                })
            })
        }
        else {
            let update_query = `UPDATE comment_vote SET
                value = COALESCE(?, value) WHERE comment_id = ? AND user_id = (SELECT user_id FROM user WHERE email = ?)`
            let update_params = [req.body.value, req.params.comment_id, req.auth_token.username]
            db.run(update_query, update_params, function(err, result) {
                if (err) {
                    res.status(400).json({"error": err.message})
                    return
                }
                res.json({
                    message: "success",
                    data: {
                        "user": req.auth_token.username,
                        "comment_id": req.params.comment_id,
                        "value": req.body.value
                    },
                    changes: this.changes
                })
            })
        }
    })
})

module.exports = router
