import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import devisRoutes from './routes/devis.routes.js'
import sinistreRoutes from './routes/sinistre.routes.js'

dotenv.config()

const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/devis', devisRoutes)
app.use('/api/sinistres', sinistreRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API en marche 🚀' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})