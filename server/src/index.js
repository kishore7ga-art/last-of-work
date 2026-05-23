require('dotenv').config()

const dns = require('dns')
try { dns.setServers(['8.8.8.8', '1.1.1.1']) } catch (e) {}

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const compression = require('compression')
const path = require('path')

const app = express()

// Middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT',
    'DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type',
    'Authorization'],
  credentials: true
}))
app.options('*', cors())

// Mock user middleware (no auth)
app.use((req, res, next) => {
  req.user = {
    _id: '000000000000000000000001',
    name: 'Default User',
    email: 'default@user.com'
  }
  req.userId = '000000000000000000000001'
  next()
})

// Serve Angular build
const angularDist = path.join(
  __dirname,
  '../../client/dist/client/browser'
)
app.use(express.static(angularDist))

// Health check — test this first
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState
  res.json({
    status: 'ok',
    database: state === 1 
      ? 'connected' : 'disconnected',
    connected: state === 1,
    node: process.version,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// Safe route loader — won't crash on errors
const loadRoute = (urlPath, filePath) => {
  try {
    const router = require(filePath)
    app.use(urlPath, router)
    console.log(`✅ ${urlPath}`)
  } catch(e) {
    console.warn(`⚠️ Skipped ${urlPath}:`,
      e.message)
  }
}

// Load all routes
loadRoute('/api/pages', 
  './routes/pages.routes')
loadRoute('/api/public', 
  './routes/public.routes')
loadRoute('/api/components',
  './routes/components.routes')
loadRoute('/api/user',
  './routes/user.routes')
loadRoute('/api/workspaces',
  './routes/workspace.routes')
loadRoute('/api/comments',
  './routes/comment.routes')

// Serve Angular for ALL non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API route not found: ${req.path}`
    })
  }
  res.sendFile(
    path.join(angularDist, 'index.html'),
    err => {
      if (err) {
        res.status(200).send(`
          <!DOCTYPE html><html><body>
          <h2>App is starting...</h2>
          <p>Please refresh in 30 seconds.</p>
          <script>
            setTimeout(() => 
              location.reload(), 10000)
          </script>
          </body></html>
        `)
      }
    }
  )
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', 
    new Date().toISOString(), err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  })
})

// MongoDB with auto-retry
const connectDB = async (retries = 0) => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('❌ MONGO_URI not set!')
    console.error('Add MONGO_URI to Render',
      'environment variables')
    process.exit(1)
  }
  try {
    await mongoose.connect(uri, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4
    })
    console.log('✅ MongoDB Atlas Connected!')
    console.log('📦 DB:', 
      mongoose.connection.name)
  } catch(err) {
    console.error(`❌ MongoDB failed`,
      `(attempt ${retries + 1}):`, err.message)
    if (err.message.includes('whitelist') ||
        err.message.includes('IP')) {
      console.error('⚠️ Add 0.0.0.0/0 to',
        'Atlas Network Access!')
    }
    const delay = Math.min(
      1000 * Math.pow(2, retries), 30000)
    console.log(`🔄 Retry in ${delay/1000}s...`)
    setTimeout(() => connectDB(retries + 1), 
      delay)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected')
  setTimeout(() => connectDB(), 5000)
})

process.on('SIGTERM', async () => {
  await mongoose.connection.close()
  process.exit(0)
})

const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Running on port ${PORT}`)
    console.log(`📁 Angular: ${angularDist}`)
    console.log(`🏥 Health: /api/health`)
  })
})

module.exports = app
