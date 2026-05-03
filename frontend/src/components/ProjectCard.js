import React from 'react';
import { Link } from 'react-router-dom';

const catColor = {
  Education:   'bg-teal-50   text-teal-700',
  Healthcare:  'bg-amber-50  text-amber-700',
  Environment: 'bg-stone-100 text-stone-600',
  Poverty:     'bg-orange-50 text-orange-700',
  Other:       'bg-stone-100 text-stone-500',
};
const statusCfg = {
  active:    { cls: 'bg-teal-50   text-teal-700',   dot: 'bg-teal-500' },
  completed: { cls: 'bg-stone-100 text-stone-600',  dot: 'bg-stone-500' },
  pending:   { cls: 'bg-amber-50  text-amber-700',  dot: 'bg-amber-500' },
  flagged:   { cls: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
};

export default function ProjectCard({ project }) {
  const progress = Math.min((project.raisedAmount / project.targetAmount) * 100, 100);
  const sc  = statusCfg[project.status] || statusCfg.pending;
  const cat = catColor[project.category]  || catColor.Other;

  return (
    <div className="card-hover bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm group">
      <div className="h-1 w-full bg-gradient-to-r from-stone-400 via-amber-500 to-teal-500" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-800 text-base leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">{project.title}</h3>
            {project.ngo?.organization && <p className="text-xs text-stone-400 mt-0.5 truncate">{project.ngo.organization}</p>}
          </div>
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {project.status}
          </span>
        </div>

        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg mb-3 ${cat}`}>{project.category}</span>
        <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-stone-500 font-medium">Funding Progress</span>
            <span className="font-bold text-stone-700">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-teal-500 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div><p className="text-xs text-stone-400">Raised</p><p className="text-lg font-black text-teal-700">${project.raisedAmount.toLocaleString()}</p></div>
          <div className="text-right"><p className="text-xs text-stone-400">Goal</p><p className="text-lg font-black text-stone-700">${project.targetAmount.toLocaleString()}</p></div>
        </div>

        {(project.impactScore > 0 || project.transparencyRating > 0) && (
          <div className="flex gap-3 mb-4 p-3 bg-stone-50 rounded-xl">
            {project.impactScore > 0 && (
              <div className="flex-1 text-center">
                <p className="text-lg font-black text-amber-700">{project.impactScore}</p>
                <p className="text-xs text-stone-400">Impact</p>
              </div>
            )}
            {project.transparencyRating > 0 && (
              <div className="flex-1 text-center border-l border-stone-200">
                <p className="text-lg font-black text-teal-700">{project.transparencyRating}%</p>
                <p className="text-xs text-stone-400">Transparency</p>
              </div>
            )}
            {project.donorCount > 0 && (
              <div className="flex-1 text-center border-l border-stone-200">
                <p className="text-lg font-black text-stone-600">{project.donorCount}</p>
                <p className="text-xs text-stone-400">Donors</p>
              </div>
            )}
          </div>
        )}

        <Link to={`/projects/${project._id}`}
          className="block w-full text-center bg-stone-800 hover:bg-stone-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          View Details →
        </Link>
      </div>
    </div>
  );
}
