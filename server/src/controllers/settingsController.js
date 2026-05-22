// server/src/controllers/settingsController.js
const User = require('../models/User.model');

// Get user settings (theme, SEO, site settings)
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('theme treeStructure');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, settings: { theme: user.theme, treeStructure: user.treeStructure } });
  } catch (err) {
    console.error('Error fetching settings', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body; // Expect { theme, treeStructure }
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('theme treeStructure');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, settings: { theme: user.theme, treeStructure: user.treeStructure } });
  } catch (err) {
    console.error('Error updating settings', err);
    res.status(400).json({ success: false, message: err.message });
  }
};
