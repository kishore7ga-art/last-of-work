const mongoose = require('mongoose');

const globalStylesSchema = new mongoose.Schema({
  fontFamily: { type: String, default: 'Inter, sans-serif' },
  primaryColor: { type: String, default: '#3b82f6' },
  secondaryColor: { type: String, default: '#111827' },
  accentColor: { type: String, default: '#10b981' },
  baseFontSize: { type: String, default: '16px' }
}, { _id: false });

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'Untitled Page'
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  },
  blocks: {
    type: Array,
    default: []
  },
  thumbnail: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    keywords: { type: String, default: '' }
  },
  settings: {
    favicon: { type: String, default: '' },
    customCss: { type: String, default: '' },
    customJs: { type: String, default: '' },
    themeId: { type: String, default: 'clean-white' },
    customTheme: { type: Object, default: null }
  },
  viewCount: {
    type: Number,
    default: 0
  },
  globalStyles: {
    type: globalStylesSchema,
    default: () => ({})
  },
  metaTitle: {
    type: String,
    default: ''
  },
  metaDescription: {
    type: String,
    default: ''
  },
  ogImage: {
    type: String,
    default: ''
  },
  canonicalUrl: {
    type: String,
    default: ''
  },
  customDomain: {
    type: String,
    default: ''
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collaborators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastSeen: Date,
    cursorColor: String
  }],
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  versions: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pageSchema.index({ userId: 1, updatedAt: -1 });
pageSchema.index({ slug: 1 }, { unique: true });
pageSchema.index({ userId: 1, published: 1 });
pageSchema.index({ updatedAt: -1 });
pageSchema.index({ published: 1 });
pageSchema.index({ title: 'text' }, { weights: { title: 10 } });

pageSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = Date.now();
  next();
});

pageSchema.statics.generateSlug = function generateSlug(title) {
  return String(title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();
};

module.exports = mongoose.model('Page', pageSchema);
