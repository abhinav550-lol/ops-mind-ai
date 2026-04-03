// ─── Company Browser Page ─────────────────────────────────────────────────────
// Users browse all available companies and their SOPs.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Input from '../../components/Input';

export default function CompanyBrowser() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    userApi
      .getCompanies()
      .then((d) => setCompanies(d?.data || []))
      .catch((err) => setError(err.message || 'Failed to load companies.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink">Companies</h1>
        <p className="text-sm text-muted mt-1">
          {loading ? 'Loading…' : `${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'} available`}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="w-64">
        <Input
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-fog rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Company grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((company) => (
            <Link key={company._id} to={`/user/companies/${company._id}`}>
              <div className="bg-white rounded-xl border border-fog shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 p-5 h-full">
                <div className="w-10 h-10 rounded-lg bg-fog flex items-center justify-center text-lg mb-3">🏢</div>
                <h3 className="text-sm font-semibold text-ink font-body">{company.name}</h3>
                <p className="text-xs text-muted mt-1">{company.email}</p>
                <p className="text-xs text-muted mt-0.5">Joined {formatDate(company.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && companies.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-fog">
          <div className="text-4xl mb-3">🏢</div>
          <p className="text-sm font-medium text-ink mb-1">No companies yet</p>
          <p className="text-xs text-muted">Companies will appear here once they register.</p>
        </div>
      )}

      {!loading && !error && companies.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">No companies match your search.</p>
        </div>
      )}
    </div>
  );
}
