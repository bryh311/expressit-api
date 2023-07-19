const express = require('express')
const md5 = require('md5')
const app = express()
const db = require('./db/database.js')
const users = require('./routes/api/users.js')
const subgroups = require('./routes/api/subgroups')
const posts = require('./routes/api/posts.js')
const comments = require('./routers/api/comments')

const port = process.env.port || 8080

app.use('/api/users/', users)
app.use('/api/subgroups/', subgroups)
app.use('/api/posts/', posts)
app.use('/api/comments/', comments)

app.get('/', (req, res) => res.send("Hello World!"))

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})