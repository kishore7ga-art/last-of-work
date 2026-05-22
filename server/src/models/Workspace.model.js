const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  logo: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    role: {
      type: String,
      enum: ['owner','admin','editor','viewer'],
      default: 'editor'
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    },
    invitedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }],
  invites: [{
    email: String,
    role: {
      type: String,
      enum: ['admin','editor','viewer'],
      default: 'editor'
    },
    token: String,
    expiresAt: Date,
    sentAt: { type: Date, default: Date.now }
  }],
  settings: {
    allowPublicPages: { 
      type: Boolean, 
      default: true 
    },
    requireApprovalToPublish: { 
      type: Boolean, 
      default: false 
    }
  },
  plan: {
    type: String,
    enum: ['free','pro','team'],
    default: 'free'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workspace', workspaceSchema);
