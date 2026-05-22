const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth.middleware');
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  resolveComment,
  addReply
} = require('../controllers/comment.controller');

router.use(protect);

// Routes starting with /api/pages/:pageId/comments
router.route('/')
  .get(getComments)
  .post(addComment);

// Routes starting with /api/comments/:id
router.route('/:id')
  .put(updateComment)
  .delete(deleteComment);

router.post('/:id/resolve', resolveComment);
router.post('/:id/replies', addReply);

module.exports = router;
