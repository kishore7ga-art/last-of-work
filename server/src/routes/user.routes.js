const express = require('express');
const router = express.Router();
const User = require('../models/User.model');

const DEFAULT_USER_ID = '000000000000000000000001';

const ensureDefaultUser = async () => {
  let user = await User.findById(DEFAULT_USER_ID);
  if (!user) {
    try {
      user = await User.create({
        _id: DEFAULT_USER_ID,
        name: 'Default User',
        email: 'default@user.com',
        password: 'defaultpassword123'
      });
    } catch (err) {
      // Handle potential race condition or already existing
      user = await User.findById(DEFAULT_USER_ID);
    }
  }
  return user;
};

router.get('/tree', async (req, res, next) => {
  try {
    const user = await ensureDefaultUser();
    res.status(200).json({
      success: true,
      tree: user.treeStructure || null
    });
  } catch (error) {
    next(error);
  }
});

router.put('/tree', async (req, res, next) => {
  try {
    const tree = Array.isArray(req.body.tree) ? req.body.tree : null;
    if (!tree) {
      return res.status(400).json({ success: false, message: 'Tree must be an array' });
    }
    await ensureDefaultUser();
    const user = await User.findByIdAndUpdate(
      DEFAULT_USER_ID,
      { treeStructure: tree },
      { new: true, upsert: true }
    );
    res.status(200).json({
      success: true,
      tree: user.treeStructure
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
