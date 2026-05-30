const express = require('express');
const router = express.Router();
const Component = require('../models/Component.model');

// Auth middleware removed

router.get('/', async (req, res, next) => {
  try {
    const components = await Component.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, components });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, blocks, category } = req.body;
    
    if (!name || !blocks) {
      return res.status(400).json({ success: false, message: 'Name and blocks are required' });
    }

    const component = await Component.create({
      name,
      description: description || '',
      blocks,
      category: category || 'My Components',
      userId: '000000000000000000000001' // default user ID
    });

    res.status(201).json({ success: true, component });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const component = await Component.findOneAndDelete({ _id: req.params.id });
    
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    res.status(200).json({ success: true, message: 'Component deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
