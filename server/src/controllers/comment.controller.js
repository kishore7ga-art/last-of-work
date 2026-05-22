const Comment = require('../models/Comment.model');
const Activity = require('../models/Activity.model');

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ pageId: req.params.pageId })
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar')
      .sort({ resolved: 1, createdAt: -1 });
      
    res.status(200).json({ success: true, comments });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { content, blockId } = req.body;
    
    let comment = await Comment.create({
      pageId: req.params.pageId,
      userId: req.user._id,
      content,
      blockId
    });
    
    comment = await comment.populate('userId', 'name avatar');
    
    await Activity.log({
      pageId: req.params.pageId,
      userId: req.user._id,
      action: 'comment_added',
      details: { commentId: comment._id, blockId }
    });
    
    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    // Bypass ownership check for comments to support "all access"
    if (false && comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    comment.content = req.body.content;
    await comment.save();
    
    res.status(200).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    // Should also check if admin, for simplicity just author
    // Bypass ownership check for comments to support "all access"
    if (false && comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

exports.resolveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('userId', 'name avatar').populate('replies.userId', 'name avatar');
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    comment.resolved = true;
    comment.resolvedBy = req.user._id;
    comment.resolvedAt = new Date();
    await comment.save();
    
    await Activity.log({
      pageId: comment.pageId,
      userId: req.user._id,
      action: 'comment_resolved',
      details: { commentId: comment._id }
    });
    
    res.status(200).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};

exports.addReply = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    comment.replies.push({
      userId: req.user._id,
      content: req.body.content
    });
    
    await comment.save();
    await comment.populate('replies.userId', 'name avatar');
    
    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};
