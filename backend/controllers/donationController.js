const Donation = require('../models/Donation');
const Project = require('../models/Project');

exports.createDonation = async (req, res) => {
  try {
    const { project: projectId, amount, message, anonymous } = req.body;
    if (!projectId || !amount || amount <= 0)
      return res.status(400).json({ message: 'project and a positive amount are required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'active') return res.status(400).json({ message: 'Project is not accepting donations' });
    if (project.flaggedForFraud) return res.status(400).json({ message: 'This project is under review and cannot accept donations' });

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const donation = new Donation({ donor: req.user._id, project: projectId, amount, transactionId, message, anonymous });
    await donation.save();

    project.raisedAmount += amount;
    project.donorCount = await Donation.countDocuments({ project: project._id });
    if (project.raisedAmount >= project.targetAmount) project.status = 'completed';
    project.recalculate(project.donorCount);
    await project.save();

    res.status(201).json({ donation, receipt: buildReceipt(donation, project, req.user) });
  } catch (error) {
    res.status(500).json({ message: 'Donation failed' });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const filter = req.user.role === 'donor' ? { donor: req.user._id } : {};
    const donations = await Donation.find(filter)
      .populate('donor', 'name email')
      .populate('project', 'title ngo raisedAmount targetAmount impactScore')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

exports.getProjectDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ project: req.params.projectId })
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id })
      .populate('donor', 'name email')
      .populate('project', 'title ngo category');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(buildReceipt(donation, donation.project, donation.donor));
  } catch (error) {
    res.status(500).json({ message: 'Failed to get receipt' });
  }
};

const buildReceipt = (donation, project, donor) => ({
  receiptNumber: `RCP-${donation.transactionId}`,
  donorName: donation.anonymous ? 'Anonymous' : (donor.name || 'Donor'),
  donorEmail: donor.email || '',
  projectTitle: project.title || '',
  amount: donation.amount,
  transactionId: donation.transactionId,
  date: donation.createdAt,
  status: donation.status,
  message: donation.message || ''
});
