import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '12,400+', label: 'Donors Worldwide' },
  { value: '$2.8M+',  label: 'Funds Raised' },
  { value: '340+',    label: 'Projects Funded' },
  { value: '98%',     label: 'Transparency Score' },
];

const roles = [
  {
    title: 'For Donors',
    img: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&auto=format&fit=crop&q=80',
    iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    points: ['Browse verified projects', 'Track fund usage in real-time', 'Download donation receipts', 'View impact scores'],
    cta: 'Start Donating', link: '/register',
  },
  {
    title: 'For NGOs',
    img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80',
    iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    points: ['Create & manage projects', 'Upload proof & updates', 'Track milestones & expenses', 'Build donor trust'],
    cta: 'Register NGO', link: '/register',
  },
  {
    title: 'For Admins',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    points: ['Approve NGO accounts', 'Monitor all donations', 'Detect fraud patterns', 'Platform analytics'],
    cta: 'Admin Access', link: '/login',
  },
];

const features = [
  { iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', title: 'Full Transparency', desc: 'Every rupee tracked — see exactly how funds are spent with itemized expense reports.' },
  { iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Impact Scoring', desc: 'Automated scoring based on funding rate, beneficiaries, milestones, and updates.' },
  { iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure & Verified', desc: 'JWT authentication, role-based access, and admin-verified NGO accounts.' },
  { iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title: 'Live Analytics', desc: 'Real-time dashboards with charts, fund flow, and donation trends.' },
  { iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'Instant Receipts', desc: 'Auto-generated printable donation receipts with transaction IDs.' },
  { iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', title: 'Fraud Detection', desc: 'Automated alerts for suspicious spending patterns and donation anomalies.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero — full bleed photo */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80"
          alt="NGO volunteers working together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/85 via-stone-900/70 to-stone-900/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Trusted by 340+ NGOs across the globe
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Donate with <span className="text-amber-400">Complete</span> Transparency
            </h1>
            <p className="text-lg md:text-xl text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Every donation tracked. Every rupee accounted for. Real-time fund usage, impact scores, and verified NGOs — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95 shadow-xl">
                Start for Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link to="/projects" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all backdrop-blur-sm hover:scale-105 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Browse Projects
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center glass-dark rounded-2xl p-4">
                <p className="text-2xl md:text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-stone-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards with photos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-3">Built for Everyone</h2>
          <p className="text-stone-500 text-lg">One platform, three powerful roles</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(r => (
            <div key={r.title} className="card-hover rounded-3xl overflow-hidden shadow-lg border border-stone-100">
              {/* Photo header */}
              <div className="relative h-44 overflow-hidden">
                <img src={r.img} alt={r.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={r.iconPath} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-white">{r.title}</h3>
                </div>
              </div>
              {/* Content */}
              <div className="bg-white p-6">
                <ul className="space-y-3 mb-6">
                  {r.points.map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-stone-600">
                      <svg className="w-4 h-4 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to={r.link} className="block text-center bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {r.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-3">Why Choose Us?</h2>
            <p className="text-stone-500 text-lg">Everything you need for transparent giving</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card-hover group p-6 rounded-2xl border border-stone-100 hover:border-stone-300 bg-white hover:bg-stone-50/50">
                <div className="w-12 h-12 bg-stone-100 group-hover:bg-stone-200 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                  <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.iconPath} />
                  </svg>
                </div>
                <h4 className="font-bold text-stone-800 mb-2">{f.title}</h4>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact photo strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-3 gap-4 rounded-3xl overflow-hidden h-64">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop&q=80" alt="Community impact" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&auto=format&fit=crop&q=80" alt="Education project" className="w-full h-full object-cover" />
          <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&auto=format&fit=crop&q=80" alt="Healthcare NGO" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1400&auto=format&fit=crop&q=80"
            alt="Team working"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/80" />
          <div className="relative p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Make an Impact?</h2>
            <p className="text-stone-300 text-lg mb-8 max-w-xl mx-auto">Join thousands of donors and NGOs building a more transparent world.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-stone-800 font-bold px-8 py-4 rounded-2xl hover:bg-stone-100 transition-all hover:scale-105 active:scale-95 shadow-xl">
                Create Free Account
              </Link>
              <Link to="/projects" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm">
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-stone-700">NGO Platform</span>
          </div>
          <p className="text-sm text-stone-400">© 2024 NGO Donation Transparency Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
