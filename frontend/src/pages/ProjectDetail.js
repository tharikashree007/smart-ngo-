import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { projectAPI, donationAPI } from '../utils/api';

const statusColor = { pending: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', rejected: 'bg-red-100 text-red-700', flagged: 'bg-red-200 text-red-800' };

const ScoreRing = ({ value, color, label }) => (
  <div className="text-center">
    <div className="relative w-16 h-16 mx-auto">
      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${value} 100`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{value}</span>
    </div>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [donations, setDonations] = useState([]);
  const [tab, setTab] = useState('overview');
  const [donateForm, setDonateForm] = useState({ amount: '', message: '', anonymous: false });
  const [showDonate, setShowDonate] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAll(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      const [pr, dr] = await Promise.all([projectAPI.getOne(id), donationAPI.getByProject(id)]);
      setProject(pr.data);
      setDonations(dr.data);
    } catch { setMsg('Failed to load project'); }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    try {
      await donationAPI.create({ project: id, amount: Number(donateForm.amount), message: donateForm.message, anonymous: donateForm.anonymous });
      setDonateForm({ amount: '', message: '', anonymous: false });
      setShowDonate(false);
      setMsg('Donation successful! Thank you 🎉');
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Donation failed');
    }
  };

  const handleApprove = async (status) => {
    try { await projectAPI.approve(id, status); fetchAll(); setMsg(`Project ${status}`); }
    catch { setMsg('Action failed'); }
  };

  const handleFlag = async () => {
    const reason = window.prompt('Reason for flagging:');
    if (!reason) return;
    try { await projectAPI.flag(id, reason); fetchAll(); setMsg('Project flagged'); }
    catch { setMsg('Failed to flag'); }
  };

  if (!project) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const progress = Math.min((project.raisedAmount / project.targetAmount) * 100, 100);
  const spendPct = project.raisedAmount > 0 ? Math.min((project.spentAmount / project.raisedAmount) * 100, 100) : 0;
  const completedMilestones = (project.milestones || []).filter(m => m.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {msg && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm border ${msg.includes('success') || msg.includes('🎉') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            {msg} <button onClick={() => setMsg('')} className="ml-2 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[project.status]}`}>{project.status}</span>
                {project.flaggedForFraud && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">⚠ Under Review</span>}
              </div>
              <p className="text-gray-500 text-sm">{project.ngo?.organization || project.ngo?.name} · {project.category}</p>
              {project.location && <p className="text-gray-400 text-xs mt-1">📍 {project.location}</p>}
            </div>
            {/* Score Rings */}
            <div className="flex gap-6">
              <ScoreRing value={project.impactScore} color="#3B82F6" label="Impact" />
              <ScoreRing value={project.transparencyRating} color="#10B981" label="Transparency" />
            </div>
          </div>

          <p className="text-gray-600 mb-5">{project.description}</p>

          {/* Funding Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Funding Progress</span>
              <span className="font-bold text-blue-600">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Raised: <span className="font-semibold text-green-600">${project.raisedAmount.toLocaleString()}</span></span>
              <span>Target: <span className="font-semibold">${project.targetAmount.toLocaleString()}</span></span>
            </div>
          </div>

          {/* Fund Usage */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Fund Usage (Spent)</span>
              <span className="font-bold text-purple-600">{spendPct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${spendPct > 100 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(spendPct, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Spent: <span className="font-semibold text-purple-600">${project.spentAmount.toLocaleString()}</span></span>
              <span>Balance: <span className="font-semibold text-green-600">${(project.raisedAmount - project.spentAmount).toLocaleString()}</span></span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Donors', value: project.donorCount || donations.length },
              { label: 'Beneficiaries', value: project.beneficiaries },
              { label: 'Milestones', value: `${completedMilestones}/${project.milestones?.length || 0}` },
              { label: 'Updates', value: project.updates?.length || 0 }
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {user?.role === 'donor' && project.status === 'active' && (
              <button onClick={() => setShowDonate(!showDonate)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold text-sm">
                💙 Donate Now
              </button>
            )}
            {user?.role === 'admin' && project.status === 'pending' && (
              <>
                <button onClick={() => handleApprove('active')} className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 font-semibold text-sm">✅ Approve</button>
                <button onClick={() => handleApprove('rejected')} className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 font-semibold text-sm">✗ Reject</button>
              </>
            )}
            {user?.role === 'admin' && !project.flaggedForFraud && (
              <button onClick={handleFlag} className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 font-semibold text-sm">⚠ Flag</button>
            )}
            {user?.role === 'ngo' && project.ngo?._id === user.id && (
              <Link to={`/dashboard`} className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 font-semibold text-sm">⚙ Manage</Link>
            )}
          </div>
        </div>

        {/* Donate Form */}
        {showDonate && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Make a Donation</h3>
            <form onSubmit={handleDonate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[50, 100, 250, 500].map(amt => (
                  <button key={amt} type="button" onClick={() => setDonateForm({...donateForm, amount: amt})}
                    className={`py-2 rounded-lg border text-sm font-semibold transition ${Number(donateForm.amount) === amt ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-400'}`}>
                    ${amt}
                  </button>
                ))}
              </div>
              <input type="number" required min="1" placeholder="Or enter custom amount ($)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                value={donateForm.amount} onChange={e => setDonateForm({...donateForm, amount: e.target.value})} />
              <textarea rows={2} placeholder="Message (optional)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                value={donateForm.message} onChange={e => setDonateForm({...donateForm, message: e.target.value})} />
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={donateForm.anonymous} onChange={e => setDonateForm({...donateForm, anonymous: e.target.checked})} className="rounded" />
                Donate anonymously
              </label>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                Confirm Donation {donateForm.amount ? `· $${donateForm.amount}` : ''}
              </button>
            </form>
          </div>
        )}

        {/* Detail Tabs */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex border-b border-gray-100 px-4">
            {['milestones', 'expenses', 'updates', 'donors'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'milestones' && (
              <div className="space-y-3">
                {(project.milestones || []).length === 0 && <p className="text-gray-400 text-center py-6">No milestones added yet</p>}
                {(project.milestones || []).map(m => (
                  <div key={m._id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${m.status === 'completed' ? 'bg-green-100 text-green-600' : m.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      {m.status === 'completed' ? '✓' : m.status === 'in-progress' ? '⟳' : '○'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800">{m.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : m.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                      </div>
                      {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        {m.targetDate && <span>Due: {new Date(m.targetDate).toLocaleDateString()}</span>}
                        {m.completedDate && <span className="text-green-600">Completed: {new Date(m.completedDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'expenses' && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl text-center">
                  <div><p className="text-xs text-gray-500">Total Raised</p><p className="font-bold text-green-600">${project.raisedAmount.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Total Spent</p><p className="font-bold text-red-500">${project.spentAmount.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Remaining</p><p className="font-bold text-blue-600">${(project.raisedAmount - project.spentAmount).toLocaleString()}</p></div>
                </div>
                <div className="space-y-2">
                  {(project.expenses || []).length === 0 && <p className="text-gray-400 text-center py-6">No expenses recorded yet</p>}
                  {(project.expenses || []).map(ex => (
                    <div key={ex._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{ex.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{ex.category} · {new Date(ex.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500">-${ex.amount.toLocaleString()}</p>
                        {ex.receiptUrl && <a href={ex.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">📎 Receipt</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'updates' && (
              <div className="space-y-4">
                {(project.updates || []).length === 0 && <p className="text-gray-400 text-center py-6">No updates posted yet</p>}
                {(project.updates || []).slice().reverse().map(u => (
                  <div key={u._id} className="p-4 border border-gray-100 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-800">{u.title}</p>
                      <span className="text-xs text-gray-400">{new Date(u.date).toLocaleDateString()}</span>
                    </div>
                    {u.description && <p className="text-sm text-gray-600 mb-2">{u.description}</p>}
                    {u.beneficiariesReached > 0 && <p className="text-sm text-green-600 font-medium">👥 {u.beneficiariesReached} beneficiaries reached</p>}
                    {u.proofImages?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {u.proofImages.map((img, i) => (
                          <a key={i} href={img} target="_blank" rel="noreferrer" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">📎 Proof {i + 1}</a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'donors' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-3">{donations.length} donation{donations.length !== 1 ? 's' : ''} · Total: <span className="font-bold text-green-600">${project.raisedAmount.toLocaleString()}</span></p>
                {donations.length === 0 && <p className="text-gray-400 text-center py-6">No donations yet. Be the first!</p>}
                {donations.map(d => (
                  <div key={d._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{d.anonymous ? '🔒 Anonymous' : d.donor?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                      {d.message && <p className="text-xs text-gray-500 italic mt-0.5">"{d.message}"</p>}
                    </div>
                    <span className="font-bold text-green-600">${d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
