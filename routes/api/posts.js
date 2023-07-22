const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())


router.get('/post/:id', (req, res) => {
    let query = "SELECT * FROM subgroup WHERE id = ?"
    db.get(query, req.params.id, (err, row) => {
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

router.get('/group/:name/:page', (req, res) => {
    let group_query = 
    `SELECT * FROM post WHERE group_id = (SELECT group_id FROM subgroup WHERE name = ?) LIMIT ?, 10`
    let params = [req.params.name, page * 10]
    db.all(group_query, params, (err, rows) => {
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

/**
 * gives a list of posts from subscription
 */
router.get('/home/:page', authenticateToken, (req, res) => {
    let page = parseInt(req.params.page)
    let homepage_query =
    `SELECT * FROM post WHERE group_id =
    (SELECT group_id FROM subscription WHERE user_id = (SELECT user_id FROM user WHERE email = ?)) LIMIT  ?, 10`
    let params = [req.auth_token.username, page * 10]
    db.all(homepage_query, params, (err, rows) => {
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

/**
 * Posts for users who are not logged in
 */
router.get('/:page/', (req, res) => {
    let page = parseInt(req.params.page)
    let homepage_query = `SELECT * FROM post LIMIT ?, 10`
    db.all(homepage_query, page * 10, (err, rows) => {
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

router.post('/group/:name/', authenticateToken, (req,res) => {
    let insert_query = `INSERT INTO post (creator_id, group_id, title, content, votes, date, edited) 
    VALUES ((SELECT user_id FROM user WHERE email = ?), (SELECT group_id FROM subgroup WHERE name = ?), ?, ?, 0, datetime('now'), false)`
    let errors = []
    if (!req.body.title) {
        errors.push("no title!")
    }
    if (!req.body.content) {
        errors.push("no post content!")
    }

    if (errors.length > 0) {
        res.status(400).json({"error": errors.join(",")})
        return
    }

    let data = {
        creator: req.auth_token.username,
        group: req.params.name,
        title: req.body.title,
        content: req.body.title,
        votes: 0,
        date: Date.now,
        edited: false
    }

    let params = [data.creator, data.group, data.title, data.content]

    db.run(insert_query, params, function(err, result) {
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

router.post('/:id/upvote', authenticateToken, (req, res) => {
    let upvote_query = `UPDATE post SET votes = votes + 1 WHERE id = ?`
    db.run(upvote_query, req.params.id, (result, err) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message": "success"
        })
    })
})

router.post('/:id/downvote', authenticateToken, (req, res) => {
    let downvote_query = `UPDATE post SET votes = votes - 1 WHERE id = ?`
    db.run(downvote_query, req.params.id, (result, err) => {
        if (err) {
            res.status(400).json({"error": err.message})
            return
        }
        res.json({
            "message": "success"
        })
    })
})

router.patch('/update/:id', authenticateToken, (req, res) => {
    let data = {
        title: req.body.title,
        content: req.body.content,
    }
    let edit_query = `UPDATE post SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        edited = true
        WHERE post_id = ? AND creator_id = (SELECT user_id FROM user WHERE email = ?)`
    
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
    let delete_query = "DELETE FROM post WHERE post_id = ?"
    db.run(delete_query, req.params.id, function(err, result) {
        if (err) {
            res.status(400).json({"error": res.message})
            return
        }
        let comment_delete_query = "DELETE FROM comment WHERE comment_id = ?"
        db.run(comment_delete_query, req.params.id, function(err, result) {
            if (err) {
                res.status(400).json({"error": res.message})
                return
            }
            res.json({"message": "deleted", "changes": this.changes})
        })
    })
})



module.exports = router