import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI } from '../utils/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ImpactMeter = ({ score, label, color }) => (
  <div className="text-center">
    <div className="relative w-20 h-20 mx-auto mb-2">
      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${score} 100`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color }}>{score}</span>
    </div>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [tab, setTab] = useState('overview');
  const [receiptData, setReceiptData] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [dr] = await Promise.all([donationAPI.getAll()]);
      setDonations(dr.data);
    } catch { setMsg('Failed to load data'); }
  };

  const handleDownloadReceipt = async (donationId) => {
    try {
      const r = await donationAPI.getReceipt(donationId);
      setReceiptData(r.data);
    } catch { setMsg('Failed to fetch receipt'); }
  };

  const printReceipt = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Donation Receipt</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:500px;margin:auto}
      h2{color:#1d4ed8}table{width:100%;border-collapse:collapse;margin-top:20px}
      td{padding:10px;border-bottom:1px solid #e5e7eb}td:first-child{color:#6b7280;font-size:14px}
      td:last-child{font-weight:600}.footer{margin-top:30px;font-size:12px;color:#9ca3af;text-align:center}</style>
      </head><body>
      <h2>Donation Receipt</h2>
      <p style="color:#6b7280;font-size:14px">Receipt #: ${receiptData.receiptNumber}</p>
      <table>
        <tr><td>Donor</td><td>${receiptData.donorName}</td></tr>
        <tr><td>Email</td><td>${receiptData.donorEmail}</td></tr>
        <tr><td>Project</td><td>${receiptData.projectTitle}</td></tr>
        <tr><td>Amount</td><td style="color:#16a34a;font-size:18px">$${receiptData.amount}</td></tr>
        <tr><td>Transaction ID</td><td style="font-family:monospace;font-size:12px">${receiptData.transactionId}</td></tr>
        <tr><td>Date</td><td>${new Date(receiptData.date).toLocaleString()}</td></tr>
        <tr><td>Status</td><td>${receiptData.status}</td></tr>
        ${receiptData.message ? `<tr><td>Message</td><td>${receiptData.message}</td></tr>` : ''}
      </table>
      <div class="footer">Thank you for your generous contribution. This receipt is auto-generated.</div>
      </body></html>`);
    w.document.close();
    w.print();
  };

  const totalDonated = donations.reduce((s, d) => s + d.amount, 0);
  const uniqueProjects = new Set(donations.map(d => d.project?._id || d.project)).size;
  const avgImpact = donations.length
    ? Math.round(donations.reduce((s, d) => s + (d.project?.impactScore || 0), 0) / donations.length)
    : 0;

  const categoryBreakdown = donations.reduce((acc, d) => {
    const cat = d.project?.category || 'Other';
    acc[cat] = (acc[cat] || 0) + d.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));

  const monthlyData = donations.reduce((acc, d) => {
    const key = new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    acc[key] = (acc[key] || 0) + d.amount;
    return acc;
  }, {});
  const barData = Object.entries(monthlyData).map(([name, amount]) => ({ name, amount })).slice(-6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Donor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Track your impact and donation history</p>
          </div>
          <Link to="/projects" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold text-sm">
            Browse Projects
          </Link>
        </div>

        {msg && <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Donated', value: `$${totalDonated.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Projects Supported', value: uniqueProjects, color: 'text-blue-600', bg: 'bg-blue-50', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Donations Made', value: donations.length, color: 'text-purple-600', bg: 'bg-purple-50', path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Avg Impact Score', value: avgImpact, color: 'text-yellow-600', bg: 'bg-yellow-50', path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.path} /></svg>
              </div>
              <div><p className="text-xs text-gray-500">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['overview', 'history', 'impact'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-700 mb-4">Donations by Category</h3>
              {pieData.length > 0
                ? <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: $${value}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `$${v}`} /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                : <p className="text-gray-400 text-center py-16">No donations yet</p>
              }
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-700 mb-4">Monthly Giving</h3>
              {barData.length > 0
                ? <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip formatter={v => `$${v}`} />
                      <Bar dataKey="amount" fill="#3B82F6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                : <p className="text-gray-400 text-center py-16">No data yet</p>
              }
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700">Donation History ({donations.length})</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>{['Date','Project','Amount','Transaction ID','Status','Receipt'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Link to={`/projects/${d.project?._id || d.project}`} className="text-blue-600 hover:underline font-medium">
                          {d.project?.title || 'Project'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">${d.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{d.transactionId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDownloadReceipt(d._id)} className="inline-flex items-center gap-1 text-blue-500 hover:underline text-xs font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No donations yet. <Link to="/projects" className="text-blue-500 hover:underline">Browse projects</Link></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'impact' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-700 mb-6">Impact of Your Donations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {donations.slice(0, 4).map(d => (
                  <div key={d._id} className="text-center p-4 border border-gray-100 rounded-xl">
                    <ImpactMeter score={d.project?.impactScore || 0} label={d.project?.title?.substring(0, 20) || 'Project'} color="#3B82F6" />
                    <p className="text-xs text-gray-400 mt-2">${d.amount} donated</p>
                  </div>
                ))}
                {donations.length === 0 && <p className="col-span-4 text-gray-400 text-center py-8">Donate to projects to see your impact</p>}
              </div>
            </div>

            {/* Supported Projects Transparency */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-700">Projects You've Supported</h3></div>
              <div className="divide-y divide-gray-100">
                {[...new Map(donations.map(d => [d.project?._id, d])).values()].map(d => {
                  const proj = d.project;
                  if (!proj) return null;
                  const pct = proj.targetAmount ? Math.min((proj.raisedAmount / proj.targetAmount) * 100, 100) : 0;
                  return (
                    <div key={proj._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link to={`/projects/${proj._id}`} className="font-semibold text-gray-800 hover:text-blue-600 truncate block">{proj.title}</Link>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Funding Progress</span><span>{pct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-center shrink-0">
                        <div><p className="text-xs text-gray-400">Impact</p><p className="font-bold text-blue-600">{proj.impactScore || 0}</p></div>
                        <div><p className="text-xs text-gray-400">Transparency</p><p className="font-bold text-green-600">{proj.transparencyRating || 0}%</p></div>
                        <div><p className="text-xs text-gray-400">Your Gift</p><p className="font-bold text-purple-600">${donations.filter(x => (x.project?._id || x.project) === proj._id).reduce((s, x) => s + x.amount, 0)}</p></div>
                      </div>
                    </div>
                  );
                })}
                {donations.length === 0 && <p className="p-6 text-gray-400 text-center">No projects supported yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Donation Receipt
              </h3>
              <button onClick={() => setReceiptData(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Receipt #', receiptData.receiptNumber],
                ['Donor', receiptData.donorName],
                ['Project', receiptData.projectTitle],
                ['Amount', `$${receiptData.amount}`],
                ['Transaction ID', receiptData.transactionId],
                ['Date', new Date(receiptData.date).toLocaleString()],
                ['Status', receiptData.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">{k}</span>
                  <span className={`font-semibold ${k === 'Amount' ? 'text-green-600 text-base' : 'text-gray-800'}`}>{v}</span>
                </div>
              ))}
              {receiptData.message && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Message</span>
                  <span className="font-semibold text-gray-800 text-right max-w-xs">{receiptData.message}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={printReceipt} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print / Save PDF
              </button>
              <button onClick={() => setReceiptData(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-semibold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
