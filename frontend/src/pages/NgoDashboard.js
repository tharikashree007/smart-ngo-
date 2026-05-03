import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { projectAPI, donationAPI } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const statIcons = {
  folder: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  dollar: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  chart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};
const StatCard = ({ label, value, color = 'text-blue-600', icon }) => (
  <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">{statIcons[icon] || statIcons.folder}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const statusColor = { pending: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', rejected: 'bg-red-100 text-red-700', flagged: 'bg-red-200 text-red-800' };

export default function NgoDashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('overview');
  const [projectTab, setProjectTab] = useState('milestones');
  const [msg, setMsg] = useState('');

  // Forms
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', targetDate: '', status: 'pending' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'other', receiptUrl: '' });
  const [updateForm, setUpdateForm] = useState({ title: '', description: '', beneficiariesReached: '', proofImages: '' });

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [pr, dr] = await Promise.all([projectAPI.getAll(), donationAPI.getAll()]);
      setProjects(pr.data);
      setDonations(dr.data);
      if (pr.data.length > 0 && !selected) setSelected(pr.data[0]);
    } catch { setMsg('Failed to load data'); }
  };

  const refreshSelected = async (id) => {
    const r = await projectAPI.getOne(id);
    setSelected(r.data);
    setProjects(prev => prev.map(p => p._id === id ? r.data : p));
  };

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.addMilestone(selected._id, milestoneForm);
      await refreshSelected(selected._id);
      setMilestoneForm({ title: '', description: '', targetDate: '', status: 'pending' });
      notify('Milestone added');
    } catch { notify('Failed to add milestone'); }
  };

  const handleMilestoneStatus = async (mId, status) => {
    try {
      await projectAPI.updateMilestone(selected._id, mId, { status });
      await refreshSelected(selected._id);
      notify('Milestone updated');
    } catch { notify('Failed to update milestone'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.addExpense(selected._id, { ...expenseForm, amount: Number(expenseForm.amount) });
      await refreshSelected(selected._id);
      setExpenseForm({ title: '', amount: '', category: 'other', receiptUrl: '' });
      notify('Expense recorded');
    } catch { notify('Failed to add expense'); }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    try {
      const proofImages = updateForm.proofImages ? updateForm.proofImages.split(',').map(s => s.trim()).filter(Boolean) : [];
      await projectAPI.addUpdate(selected._id, { ...updateForm, proofImages, beneficiariesReached: Number(updateForm.beneficiariesReached) || 0 });
      await refreshSelected(selected._id);
      setUpdateForm({ title: '', description: '', beneficiariesReached: '', proofImages: '' });
      notify('Update posted');
    } catch { notify('Failed to post update'); }
  };

  const totalRaised = projects.reduce((s, p) => s + p.raisedAmount, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spentAmount, 0);
  const myDonations = donations.filter(d => projects.some(p => p._id === (d.project?._id || d.project)));

  const fundFlow = projects.slice(0, 6).map(p => ({
    name: p.title.substring(0, 14),
    raised: p.raisedAmount,
    spent: p.spentAmount
  }));

  const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent';
  const btn = 'px-4 py-2 rounded-lg text-sm font-semibold transition';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">NGO Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.organization || user?.name}</p>
          </div>
          <Link to="/projects/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold text-sm">
            + New Project
          </Link>
        </div>

        {msg && <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="My Projects" value={projects.length} icon="folder" color="text-blue-600" />
          <StatCard label="Active" value={projects.filter(p => p.status === 'active').length} icon="check" color="text-green-600" />
          <StatCard label="Total Raised" value={`$${totalRaised.toLocaleString()}`} icon="dollar" color="text-yellow-600" />
          <StatCard label="Total Spent" value={`$${totalSpent.toLocaleString()}`} icon="chart" color="text-purple-600" />
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['overview', 'manage'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'manage' ? 'Manage Projects' : 'Overview'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">Fund Flow (Raised vs Spent)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={fundFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="raised" fill="#3B82F6" radius={[4,4,0,0]} />
                    <Bar dataKey="spent" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">Recent Donations</h3>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {myDonations.slice(0, 8).map(d => (
                    <div key={d._id} className="flex justify-between items-center text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{d.anonymous ? 'Anonymous' : d.donor?.name}</p>
                        <p className="text-gray-400 text-xs">{d.project?.title} · {new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-green-600">${d.amount}</span>
                    </div>
                  ))}
                  {myDonations.length === 0 && <p className="text-gray-400 text-center py-4">No donations yet</p>}
                </div>
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700">My Projects</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>{['Title','Status','Raised','Target','Progress','Impact','Transparency','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map(p => {
                      const pct = Math.min((p.raisedAmount / p.targetAmount) * 100, 100);
                      return (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[p.status]}`}>{p.status}</span></td>
                          <td className="px-4 py-3 text-green-600 font-semibold">${p.raisedAmount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-500">${p.targetAmount.toLocaleString()}</td>
                          <td className="px-4 py-3 w-32">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                          </td>
                          <td className="px-4 py-3 font-bold text-blue-600">{p.impactScore}</td>
                          <td className="px-4 py-3 font-bold text-green-600">{p.transparencyRating}%</td>
                          <td className="px-4 py-3">
                            <button onClick={() => { setSelected(p); setTab('manage'); }} className="text-blue-600 hover:underline text-xs font-medium">Manage</button>
                          </td>
                        </tr>
                      );
                    })}
                    {projects.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No projects yet. <Link to="/projects/create" className="text-blue-500 hover:underline">Create one</Link></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Project Selector */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Select Project</h3>
              {projects.map(p => (
                <button key={p._id} onClick={() => { setSelected(p); refreshSelected(p._id); }}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition ${selected?._id === p._id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'}`}>
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className={`text-xs mt-0.5 ${selected?._id === p._id ? 'text-blue-200' : 'text-gray-400'}`}>{p.status}</p>
                </button>
              ))}
            </div>

            {/* Project Detail Panel */}
            {selected && (
              <div className="lg:col-span-3 space-y-4">
                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-xs text-gray-500">Impact Score</p>
                    <p className="text-3xl font-bold text-blue-600">{selected.impactScore}</p>
                    <p className="text-xs text-gray-400">/ 100</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-xs text-gray-500">Transparency</p>
                    <p className="text-3xl font-bold text-green-600">{selected.transparencyRating}%</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-4 text-center">
                    <p className="text-xs text-gray-500">Fund Usage</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {selected.raisedAmount > 0 ? ((selected.spentAmount / selected.raisedAmount) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="bg-white rounded-xl shadow">
                  <div className="flex border-b border-gray-100 px-4">
                    {['milestones','expenses','updates'].map(t => (
                      <button key={t} onClick={() => setProjectTab(t)}
                        className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition ${projectTab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {t} {t === 'milestones' ? `(${selected.milestones?.length || 0})` : t === 'expenses' ? `(${selected.expenses?.length || 0})` : `(${selected.updates?.length || 0})`}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Milestones */}
                    {projectTab === 'milestones' && (
                      <div className="space-y-4">
                        <form onSubmit={handleAddMilestone} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                          <h4 className="col-span-2 font-semibold text-gray-700 text-sm">Add Milestone</h4>
                          <input className={input} placeholder="Title *" required value={milestoneForm.title} onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})} />
                          <input className={input} type="date" value={milestoneForm.targetDate} onChange={e => setMilestoneForm({...milestoneForm, targetDate: e.target.value})} />
                          <textarea className={`${input} col-span-2`} rows={2} placeholder="Description" value={milestoneForm.description} onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})} />
                          <button type="submit" className={`${btn} col-span-2 bg-blue-600 text-white hover:bg-blue-700`}>Add Milestone</button>
                        </form>
                        <div className="space-y-2">
                          {(selected.milestones || []).map(m => (
                            <div key={m._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{m.title}</p>
                                <p className="text-xs text-gray-400">{m.description} {m.targetDate && `· Due: ${new Date(m.targetDate).toLocaleDateString()}`}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : m.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                                {m.status !== 'completed' && (
                                  <select className="text-xs border border-gray-200 rounded px-1 py-0.5" onChange={e => handleMilestoneStatus(m._id, e.target.value)} defaultValue="">
                                    <option value="" disabled>Update</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          ))}
                          {(selected.milestones || []).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No milestones yet</p>}
                        </div>
                      </div>
                    )}

                    {/* Expenses */}
                    {projectTab === 'expenses' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg text-center">
                          <div><p className="text-xs text-gray-500">Raised</p><p className="font-bold text-green-600">${selected.raisedAmount.toLocaleString()}</p></div>
                          <div><p className="text-xs text-gray-500">Spent</p><p className="font-bold text-red-500">${selected.spentAmount.toLocaleString()}</p></div>
                          <div><p className="text-xs text-gray-500">Balance</p><p className="font-bold text-blue-600">${(selected.raisedAmount - selected.spentAmount).toLocaleString()}</p></div>
                        </div>
                        <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                          <h4 className="col-span-2 font-semibold text-gray-700 text-sm">Record Expense</h4>
                          <input className={input} placeholder="Title *" required value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} />
                          <input className={input} type="number" placeholder="Amount *" required min="1" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                          <select className={input} value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                            {['staff','materials','logistics','admin','other'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input className={input} placeholder="Receipt URL (optional)" value={expenseForm.receiptUrl} onChange={e => setExpenseForm({...expenseForm, receiptUrl: e.target.value})} />
                          <button type="submit" className={`${btn} col-span-2 bg-blue-600 text-white hover:bg-blue-700`}>Record Expense</button>
                        </form>
                        <div className="space-y-2">
                          {(selected.expenses || []).map(ex => (
                            <div key={ex._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{ex.title}</p>
                                <p className="text-xs text-gray-400 capitalize">{ex.category} · {new Date(ex.date).toLocaleDateString()}</p>
                              </div>
                              <span className="font-bold text-red-500">-${ex.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          {(selected.expenses || []).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No expenses recorded</p>}
                        </div>
                      </div>
                    )}

                    {/* Updates */}
                    {projectTab === 'updates' && (
                      <div className="space-y-4">
                        <form onSubmit={handleAddUpdate} className="grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-700 text-sm">Post Progress Update</h4>
                          <input className={input} placeholder="Update Title *" required value={updateForm.title} onChange={e => setUpdateForm({...updateForm, title: e.target.value})} />
                          <textarea className={input} rows={3} placeholder="Description" value={updateForm.description} onChange={e => setUpdateForm({...updateForm, description: e.target.value})} />
                          <input className={input} type="number" placeholder="Beneficiaries Reached" min="0" value={updateForm.beneficiariesReached} onChange={e => setUpdateForm({...updateForm, beneficiariesReached: e.target.value})} />
                          <input className={input} placeholder="Proof image URLs (comma-separated)" value={updateForm.proofImages} onChange={e => setUpdateForm({...updateForm, proofImages: e.target.value})} />
                          <button type="submit" className={`${btn} bg-blue-600 text-white hover:bg-blue-700`}>Post Update</button>
                        </form>
                        <div className="space-y-3">
                          {(selected.updates || []).slice().reverse().map(u => (
                            <div key={u._id} className="p-4 border border-gray-100 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-sm">{u.title}</p>
                                <span className="text-xs text-gray-400">{new Date(u.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-600">{u.description}</p>
                              {u.beneficiariesReached > 0 && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> {u.beneficiariesReached} beneficiaries reached</p>}
                              {u.proofImages?.length > 0 && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {u.proofImages.map((img, i) => (
                                    <a key={i} href={img} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg> Proof {i + 1}</a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {(selected.updates || []).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No updates posted yet</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
