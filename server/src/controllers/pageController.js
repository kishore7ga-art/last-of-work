// server/src/controllers/pageController.js
const Page = require('../models/Page.model');

// Get all pages for the authenticated user
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({ success: true, count: pages.length, pages });
  } catch (err) {
    console.error('Error fetching pages', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single page by id
exports.getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, userId: req.userId });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (err) {
    console.error('Error fetching page', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new page
exports.createPage = async (req, res) => {
  try {
    const data = req.body;
    data.userId = req.userId; // associate with user
    const page = await Page.create(data);
    res.status(201).json({ success: true, page });
  } catch (err) {
    console.error('Error creating page', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update an existing page
exports.updatePage = async (req, res) => {
  try {
    const updates = req.body;
    const page = await Page.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (err) {
    console.error('Error updating page', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a page
exports.deletePage = async (req, res) => {
  try {
    const result = await Page.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) {
    console.error('Error deleting page', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
