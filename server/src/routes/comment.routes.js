const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  resolveComment,
  addReply
} = require('../controllers/comment.controller');

// Routes starting with /api/pages/:pageId/comments or /api/comments
router.route('/')
  .get(getComments)
  .post(addComment);

router.route('/:id')
  .put(updateComment)
  .delete(deleteComment);

router.post('/:id/resolve', resolveComment);
router.post('/:id/replies', addReply);

module.exports = router;
