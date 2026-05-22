// server/scripts/migrate-data.js
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}
require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27018/mybuilder';
const REMOTE_URI = process.env.MONGO_URI || 'mongodb+srv://admin:test123@cluster0.yvbc9ma.mongodb.net/mybuilder?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('🔌 Connecting to databases...');
  
  const localConn = mongoose.createConnection(LOCAL_URI);
  const remoteConn = mongoose.createConnection(REMOTE_URI);
  
  await Promise.all([
    localConn.asPromise(),
    remoteConn.asPromise()
  ]);
  
  console.log('✅ Connected to local and remote databases.');
  
  const localDb = localConn.db;
  const remoteDb = remoteConn.db;
  
  // List all collections in local database
  const collections = await localDb.listCollections().toArray();
  const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));
  
  console.log(`📦 Found collections to migrate: ${collectionNames.join(', ')}`);
  
  for (const colName of collectionNames) {
    console.log(`⏳ Migrating collection: "${colName}"...`);
    
    const localCol = localDb.collection(colName);
    const remoteCol = remoteDb.collection(colName);
    
    // Fetch all documents from local collection
    const docs = await localCol.find({}).toArray();
    console.log(`   Fetched ${docs.length} documents from local collection.`);
    
    if (docs.length === 0) {
      console.log(`   Collection "${colName}" is empty. Skipping.`);
      continue;
    }
    
    // Drop remote collection if it exists to ensure a clean overwrite, or just clear documents
    try {
      await remoteCol.deleteMany({});
      console.log(`   Cleared remote collection "${colName}".`);
    } catch (err) {
      console.log(`   Notice: Could not clear remote collection "${colName}": ${err.message}`);
    }
    
    // Insert all documents into remote collection
    const result = await remoteCol.insertMany(docs);
    console.log(`   ✅ Successfully inserted ${result.insertedCount} documents into remote collection.`);
  }
  
  console.log('🎉 Migration complete!');
  
  await Promise.all([
    localConn.close(),
    remoteConn.close()
  ]);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
