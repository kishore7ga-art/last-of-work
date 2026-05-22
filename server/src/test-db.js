const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require('dotenv').config();

const Workspace = require('./models/Workspace.model');
const Page = require('./models/Page.model');
const User = require('./models/User.model');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');
  
  const users = await User.find({});
  console.log('Users:', users.map(u => ({ id: u._id, name: u.name, email: u.email })));
  
  const workspaces = await Workspace.find({});
  console.log('Workspaces:', workspaces);
  
  const pages = await Page.find({});
  console.log('Pages count:', pages.length);
  
  await mongoose.disconnect();
}

test().catch(console.error);
