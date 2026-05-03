const User = require('../models/User');
const jwt = require('jsonwebtoken');

const VALID_ROLES = ['admin', 'ngo', 'donor'];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ngoplatform.com';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization: user.organization || null
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'name, email, password and role are required' });

    if (!VALID_ROLES.includes(role))
      return res.status(400).json({ message: `role must be one of: ${VALID_ROLES.join(', ')}` });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    if (role === 'ngo' && !organization)
      return res.status(400).json({ message: 'organization is required for NGO accounts' });

    // Only one admin allowed — and only via the designated admin email
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists)
        return res.status(403).json({ message: 'An admin account already exists. Only one admin is allowed.' });
      if (email.toLowerCase().trim() !== ADMIN_EMAIL)
        return res.status(403).json({ message: `Admin registration is restricted to the designated admin email.` });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, role, organization });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: safeUserPayload(user) });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: safeUserPayload(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  res.json(safeUserPayload(req.user));
};
