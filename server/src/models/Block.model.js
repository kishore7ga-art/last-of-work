// server/src/models/Block.model.js
const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blocks: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);
