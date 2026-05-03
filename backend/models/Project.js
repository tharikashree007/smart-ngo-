const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  targetDate: Date,
  completedDate: Date,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  proofUrl: String
});

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['staff', 'materials', 'logistics', 'admin', 'other'], default: 'other' },
  date: { type: Date, default: Date.now },
  receiptUrl: String,
  approvedByAdmin: { type: Boolean, default: false }
});

const updateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  proofImages: [String],
  beneficiariesReached: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 1 },
  raisedAmount: { type: Number, default: 0 },
  spentAmount: { type: Number, default: 0 },
  category: { type: String, required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'rejected', 'flagged'], default: 'pending' },
  impactScore: { type: Number, default: 0, min: 0, max: 100 },
  transparencyRating: { type: Number, default: 0, min: 0, max: 100 },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  beneficiaries: { type: Number, default: 0 },
  location: String,
  milestones: [milestoneSchema],
  expenses: [expenseSchema],
  updates: [updateSchema],
  flaggedForFraud: { type: Boolean, default: false },
  flagReason: String,
  donorCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate impact score and transparency rating
projectSchema.methods.recalculate = function (donationCount) {
  const fundingRate = Math.min((this.raisedAmount / this.targetAmount) * 100, 100);
  const donors = donationCount || this.donorCount;
  const donorScore = Math.min(donors * 2, 20);
  const beneficiaryScore = Math.min(this.beneficiaries / 10, 20);
  const milestoneScore = this.milestones.length
    ? (this.milestones.filter(m => m.status === 'completed').length / this.milestones.length) * 20
    : 0;
  const updateScore = Math.min(this.updates.length * 4, 20);
  this.impactScore = Math.round(
    fundingRate * 0.2 + donorScore + beneficiaryScore + milestoneScore + updateScore
  );

  const hasExpenses = this.expenses.length > 0;
  const hasUpdates = this.updates.length > 0;
  const hasProof = this.updates.some(u => u.proofImages && u.proofImages.length > 0);
  const hasMilestones = this.milestones.length > 0;
  const spendRatio = this.raisedAmount > 0 ? this.spentAmount / this.raisedAmount : 0;
  const spendScore = spendRatio <= 1 ? 25 : 0;
  this.transparencyRating = Math.round(
    (hasExpenses ? 25 : 0) + (hasUpdates ? 20 : 0) + (hasProof ? 20 : 0) +
    (hasMilestones ? 10 : 0) + spendScore
  );
};

module.exports = mongoose.model('Project', projectSchema);
