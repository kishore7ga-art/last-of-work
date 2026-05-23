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
app.use(cors({ origin: '*', credentials: true }))
app.options('*', cors())

// Mock user middleware for no-auth environment
app.use((req, res, next) => {
  req.user = {
    _id: '000000000000000000000001',
    name: 'Default User',
    email: 'default@user.com'
  }
  next()
})

// Serve Angular build
const angularDist = path.join(
  __dirname,
  '../../client/dist/client/browser'
)
app.use(express.static(angularDist))

// Health check
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState
  res.json({
    status: 'ok',
    database: state === 1 
      ? 'connected' : 'disconnected',
    connected: state === 1,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// API Routes — NO auth middleware
try {
  app.use('/api/pages', require('./routes/pages.routes'))
  console.log('✅ Route: /api/pages')
} catch (e) {
  console.warn('⚠️ Skipped /api/pages:', e.message)
}

try {
  app.use('/api/public', require('./routes/public.routes'))
  console.log('✅ Route: /api/public')
} catch (e) {
  console.warn('⚠️ Skipped /api/public:', e.message)
}

try {
  app.use('/api/components', require('./routes/components.routes'))
  console.log('✅ Route: /api/components')
} catch (e) {
  console.warn('⚠️ Skipped /api/components:', e.message)
}

try {
  app.use('/api/user', require('./routes/user.routes'))
  console.log('✅ Route: /api/user')
} catch (e) {
  console.warn('⚠️ Skipped /api/user:', e.message)
}

try {
  app.use('/api/workspaces', require('./routes/workspace.routes'))
  console.log('✅ Route: /api/workspaces')
} catch (e) {
  console.warn('⚠️ Skipped /api/workspaces:', e.message)
}


// Serve Angular for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    })
  }
  res.sendFile(
    path.join(angularDist, 'index.html'),
    err => {
      if (err) {
        res.status(200).send(`
          <h2>Building Angular app...</h2>
          <p>Please wait and refresh.</p>
        `)
      }
    }
  )
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  })
})

// MongoDB Connection
const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('❌ MONGO_URI not set!')
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
    console.log('📦 DB:', mongoose.connection.name)
  } catch(err) {
    console.error('❌ MongoDB Error:', err.message)
    console.log('🔄 Retrying in 5s...')
    setTimeout(connectDB, 5000)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected — retrying')
  setTimeout(connectDB, 3000)
})

const PORT = process.env.PORT || 3000
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server on port ${PORT}`)
    console.log(`📁 Angular: ${angularDist}`)
  })
})

module.exports = app
