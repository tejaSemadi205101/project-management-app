import express from 'express';
import cors from 'cors';

const app = express()

app.use(express.json("16kb"))
app.use(express.urlencoded({extended : true, limit : '16kb'}))
app.use(express.static('public'))

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'https://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

import healthCheckRouter from './routes/healthcheck.routes.js';

app.use('/api/v1/healthcheck', healthCheckRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/features', (req, res) => {
    res.send('Welcome to the features page')
})

export default app