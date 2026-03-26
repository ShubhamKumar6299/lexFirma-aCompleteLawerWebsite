import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lawyerAPI } from '../../services/api';
import type { Lawyer, LawyerFilters } from '../../types';
import LawyerCard from '../../components/LawyerCard/LawyerCard';
import { FaFilter, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './LawyerListing.css';

const SPECIALIZATIONS = ['Criminal Law','Family Law','Civil Law','Corporate Law','Property & Real Estate','Cyber Law','Labour Law','Taxation','Intellectual Property','Immigration','Child Custody','Divorce','Consumer Law','Constitutional Law','Other'];
const COURT_LEVELS = ['District Court','High Court','Supreme Court','Tribunal','Consumer Court'];
const INDIA_STATES = ['Delhi','Maharashtra','Karnataka','Tamil Nadu','Uttar Pradesh','West Bengal','Rajasthan','Gujarat','Telangana','Kerala','Madhya Pradesh','Bihar','Andhra Pradesh','Punjab','Haryana'];

const LawyerListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<LawyerFilters>({
    specialization: searchParams.get('specialization') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    courtLevel: searchParams.get('courtLevel') || '',
    minRating: undefined,
    maxFee: undefined,
    page: 1,
    limit: 12,
  });

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,any> = {};
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.city) params.city = filters.city;
      if (filters.state) params.state = filters.state;
      if (filters.courtLevel) params.courtLevel = filters.courtLevel;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.maxFee) params.maxFee = filters.maxFee;
      params.page = filters.page;
      params.limit = filters.limit;

      const res = await lawyerAPI.getAll(params);
      setLawyers(res.data.lawyers);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLawyers(); }, [fetchLawyers]);

  const updateFilter = (key: keyof LawyerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearchParams({});
  };

  const hasFilters = !!(filters.specialization || filters.city || filters.state || filters.courtLevel || filters.minRating || filters.maxFee);

  return (
    <div className="listing-page page">
      <div className="container">
        <div className="listing-header">
          <div>
            <h1 className="section-title">Find Your Lawyer</h1>
            <p className="section-subtitle">{total} advocates found{filters.city ? ` in ${filters.city}` : filters.state ? ` in ${filters.state}` : ''}</p>
          </div>
          <button className="btn btn-ghost filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaFilter /> Filters {hasFilters && <span className="filter-count">!</span>}
          </button>
        </div>

        <div className="listing-layout">
          {/* Sidebar */}
          <aside className={`filter-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {hasFilters && <button className="btn btn-sm btn-ghost" onClick={clearFilters}><FaTimes /> Clear</button>}
                <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Search by City</label>
              <div className="search-input-wrap">
                <FaSearch className="search-icon" />
                <input className="form-input" placeholder="e.g. Delhi, Mumbai..." value={filters.city || ''} onChange={e => updateFilter('city', e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">State</label>
              <select className="form-select" value={filters.state || ''} onChange={e => updateFilter('state', e.target.value)}>
                <option value="">All States</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Practice Area</label>
              <select className="form-select" value={filters.specialization || ''} onChange={e => updateFilter('specialization', e.target.value)}>
                <option value="">All Areas</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Court Level</label>
              <select className="form-select" value={filters.courtLevel || ''} onChange={e => updateFilter('courtLevel', e.target.value)}>
                <option value="">All Levels</option>
                {COURT_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Min Rating</label>
              <select className="form-select" value={filters.minRating || ''} onChange={e => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Consultation Fee (₹)</label>
              <input type="number" className="form-input" placeholder="Max fee..." value={filters.maxFee || ''} onChange={e => updateFilter('maxFee', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </aside>

          {/* Results */}
          <main className="listing-results">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : lawyers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚖️</div>
                <h3>No lawyers found</h3>
                <p className="empty-state-text">Try adjusting your filters or searching a different area.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid-3">
                  {lawyers.map(l => <LawyerCard key={l._id} lawyer={l} />)}
                </div>

                {pages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-ghost btn-sm" disabled={filters.page === 1} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>
                      <FaChevronLeft /> Prev
                    </button>
                    <span className="page-info">Page {filters.page} of {pages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={filters.page === pages} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>
                      Next <FaChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LawyerListing;
