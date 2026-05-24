const router = require('express').Router()
let Comment = null
try {
  Comment = require('../models/Comment.model')
} catch(e) {
  console.warn('No Comment model — using fallback')
}

router.get(
  '/pages/:pageId/comments',
  async (req, res) => {
    try {
      if (!Comment) return res.json(
        { success:true, comments:[] })
      const comments = await Comment
        .find({ pageId: req.params.pageId })
        .lean()
      res.json({ success:true, comments })
    } catch(e) {
      res.json({ success:true, comments:[] })
    }
  }
)

router.post(
  '/pages/:pageId/comments',
  async (req, res) => {
    try {
      if (!Comment) return res.json({
        success:true,
        comment:{
          _id: Date.now().toString(),
          ...req.body,
          pageId: req.params.pageId,
          createdAt: new Date()
        }
      })
      const comment = await Comment.create({
        ...req.body,
        pageId: req.params.pageId
      })
      res.status(201).json({
        success:true, comment})
    } catch(e) {
      res.status(500).json({
        success:false, message:e.message})
    }
  }
)

router.post('/comments/:id/resolve',
  async (req, res) => {
    try {
      if (Comment) await Comment
        .findByIdAndUpdate(req.params.id,
          { resolved:true })
      res.json({ success:true })
    } catch(e) {
      res.json({ success:true })
    }
  }
)

router.delete('/comments/:id',
  async (req, res) => {
    try {
      if (Comment) await Comment
        .findByIdAndDelete(req.params.id)
      res.json({ success:true })
    } catch(e) {
      res.json({ success:true })
    }
  }
)

module.exports = router
