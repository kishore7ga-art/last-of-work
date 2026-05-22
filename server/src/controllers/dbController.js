// server/src/controllers/dbController.js
const mongoose = require('mongoose');

exports.checkConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, status: 'disconnected' });
    }

    await mongoose.connection.db.admin().ping();
    return res.json({
      success: true,
      status: 'connected',
      db: mongoose.connection.name || ''
    });
  } catch (error) {
    next(error);
  }
};

exports.runMigration = async (req, res, next) => {
  const LOCAL_URI = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/mybuilder';
  const REMOTE_URI = process.env.MONGO_URI;

  if (!REMOTE_URI) {
    return res.status(500).json({ success: false, message: 'MONGO_URI is not set in environment variables' });
  }

  console.log('🔌 [Migration] Starting migration via endpoint...');
  let localConn, remoteConn;

  try {
    localConn = mongoose.createConnection(LOCAL_URI);
    remoteConn = mongoose.createConnection(REMOTE_URI);

    await Promise.all([
      localConn.asPromise(),
      remoteConn.asPromise()
    ]);

    const localDb = localConn.db;
    const remoteDb = remoteConn.db;

    const collections = await localDb.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));

    const summary = {};

    for (const colName of collectionNames) {
      const localCol = localDb.collection(colName);
      const remoteCol = remoteDb.collection(colName);

      const docs = await localCol.find({}).toArray();
      
      if (docs.length === 0) {
        summary[colName] = { status: 'skipped (empty)', count: 0 };
        continue;
      }

      // Clear remote collection
      try {
        await remoteCol.deleteMany({});
      } catch (err) {
        console.log(`[Migration] Notice: Could not clear remote collection "${colName}": ${err.message}`);
      }

      // Insert all documents
      const result = await remoteCol.insertMany(docs);
      summary[colName] = { status: 'migrated', count: result.insertedCount };
    }

    await Promise.all([
      localConn.close(),
      remoteConn.close()
    ]);

    res.json({
      success: true,
      message: 'Migration completed successfully!',
      summary
    });
  } catch (error) {
    console.error('❌ [Migration] Endpoint migration failed:', error);
    
    if (localConn) await localConn.close().catch(() => {});
    if (remoteConn) await remoteConn.close().catch(() => {});

    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
};
