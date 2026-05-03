const User = require('../models/User');
const Project = require('../models/Project');
const Donation = require('../models/Donation');

exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalDonations, flaggedProjects, pendingNGOs] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Project.countDocuments({ flaggedForFraud: true }),
      User.countDocuments({ role: 'ngo', approvedByAdmin: false })
    ]);

    const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const byStatus = await Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCategory = await Project.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, raised: { $sum: '$raisedAmount' } } }]);

    const monthlyDonations = await Donation.aggregate([
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalDonationAmount: totalDonations[0]?.total || 0,
      totalDonationCount: totalDonations[0]?.count || 0,
      flaggedProjects,
      pendingNGOs,
      usersByRole: byRole,
      projectsByStatus: byStatus,
      projectsByCategory: byCategory,
      monthlyDonations
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.approveNGO = async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'ngo' },
      { approvedByAdmin: approved !== false, flagged: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'NGO not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update NGO status' });
  }
};

exports.flagUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { flagged: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to flag user' });
  }
};

exports.getFraudAlerts = async (req, res) => {
  try {
    const flaggedProjects = await Project.find({ flaggedForFraud: true })
      .populate('ngo', 'name organization email')
      .sort({ createdAt: -1 });

    // Detect suspicious donation patterns: single donor > 80% of raised
    const suspiciousDonations = await Donation.aggregate([
      { $group: { _id: { donor: '$donor', project: '$project' }, total: { $sum: '$amount' } } },
      { $lookup: { from: 'projects', localField: '_id.project', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $addFields: { pct: { $cond: [{ $gt: ['$project.raisedAmount', 0] }, { $divide: ['$total', '$project.raisedAmount'] }, 0] } } },
      { $match: { pct: { $gt: 0.8 } } },
      { $limit: 20 }
    ]);

    res.json({ flaggedProjects, suspiciousDonations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch fraud alerts' });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email')
      .populate('project', 'title ngo')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};
