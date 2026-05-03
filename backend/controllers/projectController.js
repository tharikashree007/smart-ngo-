const Project = require('../models/Project');
const Donation = require('../models/Donation');

const recalcAndSave = async (project) => {
  const donationCount = await Donation.countDocuments({ project: project._id });
  project.donorCount = donationCount;
  project.recalculate(donationCount);
  await project.save();
  return project;
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, targetAmount, category, beneficiaries, location, endDate } = req.body;
    if (!title || !description || !targetAmount || !category)
      return res.status(400).json({ message: 'title, description, targetAmount and category are required' });
    const project = new Project({ title, description, targetAmount, category, beneficiaries, location, endDate, ngo: req.user._id });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'ngo' ? { ngo: req.user._id } : { status: { $in: ['active', 'completed'] } };
    if (req.user.role === 'admin') delete filter.status;
    const projects = await Project.find(filter).populate('ngo', 'name organization transparencyRating flagged');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('ngo', 'name organization transparencyRating flagged approvedByAdmin');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'targetAmount', 'category', 'beneficiaries', 'location', 'endDate'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const project = await Project.findOneAndUpdate({ _id: req.params.id, ngo: req.user._id }, updates, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
};

exports.approveProject = async (req, res) => {
  try {
    const status = req.body.status === 'rejected' ? 'rejected' : 'active';
    const project = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project status' });
  }
};

// ── Milestones ──────────────────────────────────────────────
exports.addMilestone = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ngo: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.milestones.push(req.body);
    await recalcAndSave(project);
    res.status(201).json(project.milestones);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add milestone' });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ngo: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    Object.assign(milestone, req.body);
    if (req.body.status === 'completed' && !milestone.completedDate) milestone.completedDate = new Date();
    await recalcAndSave(project);
    res.json(project.milestones);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update milestone' });
  }
};

// ── Expenses ────────────────────────────────────────────────
exports.addExpense = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ngo: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { title, amount, category, receiptUrl } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'title and amount are required' });
    project.expenses.push({ title, amount, category, receiptUrl });
    project.spentAmount = project.expenses.reduce((s, e) => s + e.amount, 0);

    // Fraud detection: spending > 110% of raised
    if (project.spentAmount > project.raisedAmount * 1.1) {
      project.flaggedForFraud = true;
      project.flagReason = 'Expenses exceed raised amount by more than 10%';
    }
    await recalcAndSave(project);
    res.status(201).json({ expenses: project.expenses, spentAmount: project.spentAmount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add expense' });
  }
};

// ── Progress Updates ─────────────────────────────────────────
exports.addUpdate = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ngo: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { title, description, proofImages, beneficiariesReached } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    project.updates.push({ title, description, proofImages, beneficiariesReached });
    if (beneficiariesReached) project.beneficiaries = Math.max(project.beneficiaries, beneficiariesReached);
    await recalcAndSave(project);
    res.status(201).json(project.updates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add update' });
  }
};

// ── Flag for fraud (admin) ───────────────────────────────────
exports.flagProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { flaggedForFraud: true, flagReason: req.body.reason || 'Flagged by admin', status: 'flagged' },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to flag project' });
  }
};

exports.calculateImpactScore = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const updated = await recalcAndSave(project);
    res.json({ impactScore: updated.impactScore, transparencyRating: updated.transparencyRating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate impact score' });
  }
};
