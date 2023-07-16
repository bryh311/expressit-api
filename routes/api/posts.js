const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())


router.get('/group/:name/:id', (req, res) => {

})

router.get('/group/:name/:page', (req, res) => {
    
})

/**
 * gives a list of posts from subscription
 */
router.get('/home/:page', authenticateToken, (req, res) => {

})

/**
 * Posts for users who are not logged in
 */
router.get('/', (req, res) => {

})

router.post('/group/:name/', authenticateToken, (req,res) => {
    console.log('fuckfuckfuck')
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