import React, { useState, useEffect } from 'react';
import { adminAPI, projectAPI } from '../utils/api';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
// eslint-disable-next-line no-unused-vars

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ label, value, color = 'text-blue-600', sub }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Badge = ({ status }) => {
  const map = { active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', flagged: 'bg-red-100 text-red-700', rejected: 'bg-gray-100 text-gray-600', completed: 'bg-blue-100 text-blue-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [fraud, setFraud] = useState({ flaggedProjects: [], suspiciousDonations: [] });
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, f, d] = await Promise.all([
        adminAPI.getStats(), adminAPI.getUsers(), adminAPI.getFraudAlerts(), adminAPI.getDonations()
      ]);
      setStats(s.data); setUsers(u.data); setFraud(f.data); setAllDonations(d.data);
    } catch (e) { setMsg('Failed to load data'); }
    setLoading(false);
  };

  const handleApproveNGO = async (id, approved) => {
    try {
      await adminAPI.approveNGO(id, approved);
      setMsg(approved ? 'NGO approved' : 'NGO rejected');
      fetchAll();
    } catch { setMsg('Action failed'); }
  };

  const handleApproveProject = async (id, status) => {
    try {
      await projectAPI.approve(id, status);
      setMsg(`Project ${status}`);
      fetchAll();
    } catch { setMsg('Action failed'); }
  };

  const handleFlagProject = async (id) => {
    const reason = window.prompt('Reason for flagging:');
    if (!reason) return;
    try { await projectAPI.flag(id, reason); setMsg('Project flagged'); fetchAll(); }
    catch { setMsg('Failed to flag'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  const monthlyData = (stats?.monthlyDonations || []).map(m => ({
    name: MONTHS[(m._id.month || 1) - 1],
    amount: m.total,
    count: m.count
  }));

  const statusData = (stats?.projectsByStatus || []).map(s => ({ name: s._id, value: s.count }));
  const categoryData = (stats?.projectsByCategory || []).map(c => ({ name: c._id, raised: c.raised, count: c.count }));
  const pendingNGOs = users.filter(u => u.role === 'ngo' && !u.approvedByAdmin);

  const tabs = ['overview', 'ngos', 'projects', 'donations', 'fraud'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Platform-wide monitoring & management</p>
          </div>
          {fraud.flaggedProjects.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="text-red-700 font-semibold">{fraud.flaggedProjects.length} Fraud Alert{fraud.flaggedProjects.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {msg && <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg">{msg} <button onClick={() => setMsg('')} className="ml-2 text-blue-400 hover:text-blue-600">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button></div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}{t === 'fraud' && fraud.flaggedProjects.length > 0 ? ` (${fraud.flaggedProjects.length})` : ''}
              {t === 'ngos' && pendingNGOs.length > 0 ? ` (${pendingNGOs.length})` : ''}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={stats?.totalUsers || 0} color="text-blue-600" />
              <StatCard label="Total Projects" value={stats?.totalProjects || 0} color="text-green-600" />
              <StatCard label="Total Raised" value={`$${(stats?.totalDonationAmount || 0).toLocaleString()}`} color="text-yellow-600" />
              <StatCard label="Fraud Alerts" value={stats?.flaggedProjects || 0} color="text-red-600" sub={`${stats?.pendingNGOs || 0} NGOs pending approval`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">Monthly Donations</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                    <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">Projects by Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-700 mb-4">Funds Raised by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="raised" fill="#10B981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* NGO Management */}
        {tab === 'ngos' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">NGO Accounts ({users.filter(u => u.role === 'ngo').length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>{['Name','Organization','Email','Status','Flagged','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.filter(u => u.role === 'ngo').map(u => (
                    <tr key={u._id} className={u.flagged ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.organization}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.approvedByAdmin ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {u.approvedByAdmin ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.flagged ? <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Flagged</span> : <span className="text-gray-400">—</span>}</td>
                      <td className="px-4 py-3 flex gap-2">
                        {!u.approvedByAdmin && <button onClick={() => handleApproveNGO(u._id, true)} className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Approve</button>}
                        {u.approvedByAdmin && <button onClick={() => handleApproveNGO(u._id, false)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Revoke</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Projects */}
        {tab === 'projects' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700">All Projects</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>{['Title','NGO','Category','Raised','Target','Status','Impact','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(stats?.projectsByStatus || []).length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No projects yet</td></tr>
                  )}
                </tbody>
              </table>
              <ProjectsAdminTable onApprove={handleApproveProject} onFlag={handleFlagProject} />
            </div>
          </div>
        )}

        {/* Donations */}
        {tab === 'donations' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700">All Donations ({allDonations.length})</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>{['Transaction ID','Donor','Project','Amount','Date','Status'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allDonations.map(d => (
                    <tr key={d._id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.transactionId}</td>
                      <td className="px-4 py-3">{d.anonymous ? 'Anonymous' : d.donor?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{d.project?.title}</td>
                      <td className="px-4 py-3 font-bold text-green-600">${d.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Badge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fraud */}
        {tab === 'fraud' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b bg-red-50 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="font-bold text-red-700">Flagged Projects ({fraud.flaggedProjects.length})</h3>
              </div>
              {fraud.flaggedProjects.length === 0
                ? <p className="p-6 text-gray-400 text-center">No flagged projects</p>
                : fraud.flaggedProjects.map(p => (
                  <div key={p._id} className="p-4 border-b flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{p.title}</p>
                      <p className="text-sm text-gray-500">{p.ngo?.organization} · {p.ngo?.email}</p>
                      <p className="text-sm text-red-600 mt-1">Reason: {p.flagReason}</p>
                      <p className="text-xs text-gray-400">Raised: ${p.raisedAmount} · Spent: ${p.spentAmount}</p>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))
              }
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b bg-yellow-50">
                <h3 className="font-bold text-yellow-700">Suspicious Donation Patterns ({fraud.suspiciousDonations.length})</h3>
                <p className="text-xs text-yellow-600 mt-1">Single donor contributing &gt;80% of a project's raised amount</p>
              </div>
              {fraud.suspiciousDonations.length === 0
                ? <p className="p-6 text-gray-400 text-center">No suspicious patterns detected</p>
                : fraud.suspiciousDonations.map((s, i) => (
                  <div key={i} className="p-4 border-b">
                    <p className="text-sm text-gray-700">Project: <span className="font-semibold">{s.project?.title}</span></p>
                    <p className="text-sm text-gray-500">Donor contribution: <span className="font-bold text-yellow-600">{(s.pct * 100).toFixed(1)}%</span> of total raised (${s.total?.toLocaleString()})</p>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline sub-component to fetch and render projects table
function ProjectsAdminTable({ onApprove, onFlag }) {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    import('../utils/api').then(({ projectAPI }) => projectAPI.getAll().then(r => setProjects(r.data)));
  }, []);

  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-100">
        {projects.map(p => (
          <tr key={p._id} className={p.flaggedForFraud ? 'bg-red-50' : ''}>
            <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title}</td>
            <td className="px-4 py-3 text-gray-500">{p.ngo?.organization || p.ngo?.name}</td>
            <td className="px-4 py-3 text-gray-500">{p.category}</td>
            <td className="px-4 py-3 text-green-600 font-semibold">${p.raisedAmount?.toLocaleString()}</td>
            <td className="px-4 py-3 text-gray-500">${p.targetAmount?.toLocaleString()}</td>
            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : p.status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
            <td className="px-4 py-3 font-bold text-blue-600">{p.impactScore}</td>
            <td className="px-4 py-3 flex gap-1 flex-wrap">
              {p.status === 'pending' && <>
                <button onClick={() => onApprove(p._id, 'active')} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">Approve</button>
                <button onClick={() => onApprove(p._id, 'rejected')} className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500">Reject</button>
              </>}
              {!p.flaggedForFraud && <button onClick={() => onFlag(p._id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Flag</button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
