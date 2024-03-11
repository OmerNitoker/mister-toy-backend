import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { loggerService } from './services/logger.service.js'
import { toyService } from './services/toy.service.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json()) //for req.body
app.use(express.static('public'))

//List
app.get('/api/toy', (req, res) => {
    console.log('req.query:',req.query)
    
    const { txt, maxPrice } = req.query
    const filterBy = { txt, maxPrice: +maxPrice }
    toyService.query(filterBy)
        .then(toys => {
            res.send(toys)
        })
        .catch(err => {
            loggerService.error('Cannot load toys', err)
            res.status(400).send('Cannot load toys')
        })
})

//getById
app.get('/api/toy/:toyId', (req, res) => {
    console.log('req.params:', req.params)

    const { toyId } = req.params
    toyService.get(toyId)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot get toy:', err)
            res.status(400).send(err)
        })
})

//Add
app.post('/api/toy', (req, res) => {
    const { name, price } = req.body

    const toy = {
        name,
        price: +price
    }
    toyService.save(toy)
        .then(savedToy => {
            res.send(savedToy)
        })
        .catch(err => {
            loggerService.error('Cannot add toy', err)
            res.status(400).send('Cannot add toy')
        })
})

//Edit
app.put('/api/toy', (req, res) => {
    const { name, price, _id } = req.body
    const toy = {
        _id,
        name,
        price
    }
    toyService.save(toy)
    .then(savedToy => {
        res.send(savedToy)
    })
    .catch(err => {
        loggerService.error('Cannot update toy', err)
        res.status(400).send('Cannot update toy')
    })
})

//Delete
app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.remove(toyId)
        .then(msg => {
            res.send({ msg, toyId })
        })
        .catch(err => {
            loggerService.error('Cannot delete toy', err)
            res.status(400).send('cannot delete toy, ' + err)
        })
})

app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const port = 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})