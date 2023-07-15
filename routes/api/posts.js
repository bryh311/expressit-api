const express = require('express')
const db = require('../../db/database')

const router = express.Router()
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json)


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

})


module.exports = router