const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'page_created',
      'page_updated',
      'page_deleted',
      'page_published',
      'page_unpublished',
      'comment_added',
      'comment_resolved',
      'member_invited',
      'member_joined',
      'member_removed',
      'role_changed',
      'workspace_created'
    ]
  },
  details: {
    type: Object,
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

activitySchema.statics.log = async function(data) {
  try {
    await this.create(data);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = mongoose.model('Activity', activitySchema);
