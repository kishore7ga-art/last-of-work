const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { /* ignore */ }

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const authController = require('./controllers/auth.controller');
const settingsRoutes = require('./routes/settings.routes');
const pagesRoutes = require('./routes/pages.routes');
const componentsRoutes = require('./routes/components.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const commentRoutes = require('./routes/comment.routes');
const dbRoutes = require('./routes/db.routes');
const errorHandler = require('./middleware/error.middleware');
const { protect } = require('./middleware/auth.middleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === '1';

app.use(helmet());

const compression = require('compression');
app.use(compression({
  level: 6,
  threshold: 512,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) 
      return false;
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:4200'
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const mongoOptions = {
  maxPoolSize: 20,
  minPoolSize: isVercel ? 0 : 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  readPreference: 'primaryPreferred',
  compressors: ['zlib'],
};

let mongoConnectionPromise = null;

async function ensureMongoConnection() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not set in environment variables');
  }

  if (mongoose.connection.readyState === 1) {
    app.set('mongooseState', { connected: true, name: mongoose.connection.name });
    return mongoose.connection;
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGO_URI, mongoOptions)
      .then(() => {
        console.log('MongoDB connected');
        app.set('mongooseState', { connected: true, name: mongoose.connection.name });
        return mongoose.connection;
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        app.set('mongooseState', { connected: false });
        throw error;
      });
  }

  return mongoConnectionPromise;
}

app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();

  try {
    await ensureMongoConnection();
    next();
  } catch (error) {
    next(error);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // relaxed from 10 to 100 just in case for development/testing
  message: { success: false, message: 'Too many attempts, try again later' }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MyBuilder API running',
    timestamp: new Date()
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.get('/api/user/tree', protect, authController.getTree);
app.put('/api/user/tree', protect, authController.saveTree);
app.use('/api/pages', pagesRoutes);
app.use('/api/db', dbRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/pages/:pageId/comments', commentRoutes);
app.use('/api/comments', commentRoutes); // For routes like /api/comments/:id

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist/client/browser')));
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../client/dist/client/browser/index.html'));
    } else {
      next();
    }
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const server = isVercel ? null : http.createServer(app);
if (server) {
// Start listening immediately so the API is reachable even if DB connection is pending
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('join-page', (pageId) => {
    socket.join(`page:${pageId}`);
    socket.to(`page:${pageId}`).emit('user-joined', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('leave-page', (pageId) => {
    socket.leave(`page:${pageId}`);
    socket.to(`page:${pageId}`).emit('user-left', {
      userId: socket.userId
    });
  });

  socket.on('block-updated', ({ pageId, block }) => {
    socket.to(`page:${pageId}`).emit('block-changed', {
      block,
      updatedBy: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('block-added', ({ pageId, block }) => {
    socket.to(`page:${pageId}`).emit('block-added', {
      block,
      addedBy: socket.userId
    });
  });

  socket.on('block-deleted', ({ pageId, blockId }) => {
    socket.to(`page:${pageId}`).emit('block-deleted', {
      blockId,
      deletedBy: socket.userId
    });
  });

  socket.on('cursor-move', ({ pageId, position }) => {
    socket.to(`page:${pageId}`).emit('cursor-moved', {
      userId: socket.userId,
      position
    });
  });

  socket.on('comment-added', ({ pageId, comment }) => {
    socket.to(`page:${pageId}`).emit('new-comment', {
      comment,
      addedBy: socket.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});
}

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  console.error('MONGO_URI not set in environment variables');
}

// Auto-reconnect with exponential backoff
let reconnectAttempts = 0;
function connectWithRetry() {
  const mongoOptions = {
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 20000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    readPreference: 'primaryPreferred',
    compressors: ['zlib'],
  };

  mongoose.connect(process.env.MONGO_URI, mongoOptions)
    .then(() => {
      console.log('✅ MongoDB connected');
      reconnectAttempts = 0;
      app.set('mongooseState', { connected: true, name: mongoose.connection.name });
      // Server already listening; no need to call listen again
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      app.set('mongooseState', { connected: false });
      reconnectAttempts++;
      const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts)); // max 30s
      console.log(`⏳ Retrying MongoDB connection in ${delay / 1000}s...`);
      setTimeout(connectWithRetry, delay);
    });
}
if (!isVercel && process.env.MONGO_URI) {
  connectWithRetry();
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  app.set('mongooseState', { connected: false });
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  app.set('mongooseState', { connected: true, name: mongoose.connection.name });
});

// Graceful shutdown handlers - active and ready
const gracefulShutdown = (signal) => {
  console.log(`🔌 [Shutdown] Received ${signal}. Starting graceful shutdown...`);
  if (!server) {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
    return;
  }

  server.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.once('SIGUSR2', () => {
  console.log('🔌 [Nodemon] Restarting...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
});

module.exports = app;
