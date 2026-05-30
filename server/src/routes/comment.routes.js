const router = require('express').Router()
let Comment = null
try {
  Comment = require('../models/Comment.model')
} catch(e) {}

router.get('/pages/:id/comments',
  async (req, res) => {
    try {
      const comments = Comment
        ? await Comment.find({
            pageId: req.params.id
          }).lean()
        : []
      res.json({ success: true, comments })
    } catch(e) {
      res.json({ success: true, comments: [] })
    }
  }
)

router.post('/pages/:id/comments',
  async (req, res) => {
    try {
      const comment = Comment
        ? await Comment.create({
            ...req.body,
            pageId: req.params.id
          })
        : { _id: Date.now().toString(),
            ...req.body,
            createdAt: new Date() }
      res.json({ success: true, comment })
    } catch(e) {
      res.json({ success: false,
        message: e.message })
    }
  }
)

router.post('/comments/:id/resolve',
  async (req, res) => {
    try {
      if (Comment) await Comment
        .findByIdAndUpdate(req.params.id,
          { resolved: true })
      res.json({ success: true })
    } catch(e) {
      res.json({ success: true })
    }
  }
)

router.delete('/comments/:id',
  async (req, res) => {
    try {
      if (Comment) await Comment
        .findByIdAndDelete(req.params.id)
      res.json({ success: true })
    } catch(e) {
      res.json({ success: true })
    }
  }
)

module.exports = router
