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
    let insert_query = `INSERT INTO post (creator_id, group_id, title, content, votes, date) 
    VALUES ((SELECT user_id FROM user WHERE email = ?), (SELECT group_id FROM subgroup WHERE name = ?), ?, ?, 0, datetime('now'))`
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
        date: Date.now
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


module.exports = router