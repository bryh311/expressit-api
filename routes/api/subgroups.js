const express = require('express')
const db = require('../../db/database')

const router = express.Router
const bodyParser = require('body-parser')
const {authenticateToken} = require('../../security/auth')

router.use(bodyParser.urlencoded({extended: false}))
router.use(bodyParser.json())

module.exports = router
