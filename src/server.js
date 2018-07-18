const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

const telegram = require('./telegram')
const twitter = require('./twitter')
const fb = require('./fb')

app.post('/telegram', async (req, res) => {

    if(!req.body) {
        return res.send(400)
    }

    console.log('Got telegram request: ' + JSON.stringify(req.body))

    const results = await telegram(req.body)

    res.send(results)
})

app.post('/twitter', async (req, res) => {

    if(!req.body) {
        return res.send(400)
    }

    console.log('Got twitter request: ' + JSON.stringify(req.body))

    const results = await twitter(req.body)

    res.send(results)
})

app.post('/fb', async (req, res) => {

    if(!req.body) {
        return res.send(400)
    }

    console.log('Got fb request: ' + JSON.stringify(req.body))

    const results = await fb(req.body)

    res.send(results)
})

app.listen(3000)