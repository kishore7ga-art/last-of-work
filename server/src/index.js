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
try {
  app.use('/api/pages', require('./routes/pages.routes'));
  console.log('✅ Route: /api/pages');
} catch (e) {
  console.warn('⚠️  Skipped /api/pages:', e.message);
}

try {
  app.use('/api/public', require('./routes/public.routes'));
  console.log('✅ Route: /api/public');
} catch (e) {
  console.warn('⚠️  Skipped /api/public:', e.message);
}

try {
  app.use('/api/components', require('./routes/components.routes'));
  console.log('✅ Route: /api/components');
} catch (e) {
  console.warn('⚠️  Skipped /api/components:', e.message);
}

try {
  app.use('/api/user', require('./routes/user.routes'));
  console.log('✅ Route: /api/user');
} catch (e) {
  console.warn('⚠️  Skipped /api/user:', e.message);
}

try {
  app.use('/api/workspaces', require('./routes/workspace.routes'));
  console.log('✅ Route: /api/workspaces');
} catch (e) {
  console.warn('⚠️  Skipped /api/workspaces:', e.message);
}

try {
  app.use('/api/comments', require('./routes/comment.routes'));
  console.log('✅ Route: /api/comments');
} catch (e) {
  console.warn('⚠️  Skipped /api/comments:', e.message);
}


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

// ── MongoDB Connection Helper (Serverless & Traditional) ─
const connectDB = async () => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    return mongoose.connection;
  }

  // If already connecting, wait for it
  if (state === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  await mongoose.connect(uri, {
    retryWrites:               true,
    w:                         'majority',
    serverSelectionTimeoutMS:  10000,
    socketTimeoutMS:           45000,
    connectTimeoutMS:          10000,
    maxPoolSize:               15,
    minPoolSize:               1,
    family:                    4
  });
  console.log('✅ MongoDB Connected!');
  return mongoose.connection;
};

// Database connection middleware for every incoming API request
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error('❌ Mongoose Connection Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: err.message
      });
    }
  } else {
    next();
  }
});

// Trigger connection immediately during function initialization (fire and forget)
connectDB().catch(err => console.error('Initial DB connection error:', err.message));

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// ── Start server (for traditional environments like Render/Local)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Traditional Server running on port ${PORT}`);
    console.log(`📁 Angular dist: ${angularDist}`);
  });
}

module.exports = app;

