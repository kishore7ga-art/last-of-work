require('dotenv').config()

// Fast DNS resolution
const dns = require('dns')
try { dns.setServers(['8.8.8.8', '1.1.1.1']) } catch (e) {}

const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const compression = require('compression')
const path       = require('path')

const app = express()

// ── Performance middleware ─────────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }))

// Fast JSON parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS — allow all origins (no auth)
app.use(cors({ origin: '*', credentials: true, maxAge: 86400 }))
app.options('*', cors())

// Response-time header (helps debugging latency)
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    res.setHeader && res.setHeader('X-Response-Time', `${Date.now() - start}ms`)
  })
  next()
})

// Mock user middleware (no auth)
app.use((req, res, next) => {
  req.user = {
    _id: '000000000000000000000001',
    name: 'Default User',
    email: 'default@user.com'
  }
  next()
})

// ── Static file serving — Angular build ───────────────────
const angularDist = path.join(__dirname, '../../client/dist/client/browser')
app.use(express.static(angularDist, {
  maxAge: '1d',          // cache static assets for 1 day
  etag: true,
  lastModified: true,
  index: false           // let SPA fallback handle /
}))

// ── Health check ──────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState
  res.json({
    status: 'ok',
    database: state === 1 ? 'connected' : 'disconnected',
    connected: state === 1,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime())
  })
})

// ── API Routes ────────────────────────────────────────────
const routes = [
  { path: '/api/pages',      file: './routes/pages.routes' },
  { path: '/api/public',     file: './routes/public.routes' },
  { path: '/api/components', file: './routes/components.routes' },
  { path: '/api/user',       file: './routes/user.routes' },
  { path: '/api/workspaces', file: './routes/workspace.routes' },
  { path: '/api/comments',   file: './routes/comment.routes' },
]

routes.forEach(({ path: routePath, file }) => {
  try {
    app.use(routePath, require(file))
    console.log(`✅ Route: ${routePath}`)
  } catch (e) {
    console.warn(`⚠️  Skipped ${routePath}: ${e.message}`)
  }
})

// ── SPA fallback (all non-API routes → Angular index.html) ─
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' })
  }
  res.sendFile(path.join(angularDist, 'index.html'), err => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html><html><body>
        <h2>🔄 Building...</h2>
        <p>Angular app is building. Please wait and refresh in ~60s.</p>
        <script>setTimeout(()=>location.reload(),10000)</script>
        </body></html>
      `)
    }
  })
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// ── MongoDB connection with retry ─────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('❌ MONGO_URI not set — set it in .env or env vars!')
    process.exit(1)
  }
  try {
    await mongoose.connect(uri, {
      retryWrites:               true,
      w:                         'majority',
      serverSelectionTimeoutMS:  10000,
      socketTimeoutMS:           45000,
      connectTimeoutMS:          10000,
      maxPoolSize:               20,       // increased pool for concurrency
      minPoolSize:               2,        // keep min connections warm
      family:                    4,
      heartbeatFrequencyMS:      10000,
    })
    console.log('✅ MongoDB Atlas Connected!')
    console.log('📦 DB:', mongoose.connection.name)
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message)
    console.log('🔄 Retrying in 5s...')
    setTimeout(connectDB, 5000)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected — reconnecting...')
  setTimeout(connectDB, 3000)
})

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err.message)
})

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📁 Angular dist: ${angularDist}`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
})

module.exports = app
