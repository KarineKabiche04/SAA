import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import devisRoutes from './routes/devis.routes.js'
import sinistreRoutes from './routes/sinistre.routes.js'
import vehiculeRoutes from './routes/vehicule.routes.js'
import demandeRoutes from './routes/demande.routes.js'
import messageRoutes from './routes/message.routes.js'


dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/devis', devisRoutes)
app.use('/api/sinistres', sinistreRoutes)
app.use('/api/vehicules', vehiculeRoutes)
app.use('/api/demandes', demandeRoutes)
app.use('/api/messages', messageRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API en marche 🚀' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})