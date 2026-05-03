import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { projectAPI } from '../utils/api';
import ProjectCard from '../components/ProjectCard';

const filters = ['all', 'active', 'completed', 'pending'];

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getAll().then(r => setProjects(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const mf = filter === 'all' || p.status === filter;
    const ms = p.title.toLowerCase().includes(search.toLowerCase()) ||
               p.description.toLowerCase().includes(search.toLowerCase()) ||
               (p.category || '').toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const counts = filters.reduce((a, f) => { a[f] = f === 'all' ? projects.length : projects.filter(p => p.status === f).length; return a; }, {});

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-stone-800">Projects</h1>
              <p className="text-stone-500 mt-1">{projects.length} projects across all categories</p>
            </div>
            {user?.role === 'ngo' && (
              <Link to="/projects/create" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Project
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search projects..." className="input-field pl-10 py-2.5" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-stone-800 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'}`}>
                  {f} <span className={`ml-1 text-xs ${filter === f ? 'text-stone-300' : 'text-stone-400'}`}>({counts[f]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse">
                <div className="h-4 bg-stone-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-stone-100 rounded mb-2 w-full" />
                <div className="h-3 bg-stone-100 rounded mb-4 w-2/3" />
                <div className="h-2 bg-stone-200 rounded-full mb-4" />
                <div className="h-10 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No projects found</h3>
            <p className="text-stone-400 mb-6">Try adjusting your search or filter</p>
            {user?.role === 'ngo' && <Link to="/projects/create" className="btn-primary inline-flex items-center gap-2">Create First Project</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
