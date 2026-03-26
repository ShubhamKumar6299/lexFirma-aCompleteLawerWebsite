import React, { useState, useEffect } from 'react';
import { newsAPI } from '../../services/api';
import type { NewsArticle } from '../../types';
import { FaNewspaper, FaExternalLinkAlt, FaCalendarAlt, FaSync } from 'react-icons/fa';
import './CaseSurfing.css';

const CaseSurfing: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [, setTotal] = useState(0);

  const fetchNews = async (p = 1) => {
    setLoading(true);
    try {
      const res = await newsAPI.getNews({ page: p, limit: 12 });
      setNews(res.data.news);
      setTotal(res.data.total);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  return (
    <div className="news-page page">
      <div className="container">
        <div className="news-header">
          <div>
            <h1 className="section-title">Indian Legal News</h1>
            <p className="section-subtitle">Stay updated with the latest court rulings, legal developments, and landmark cases across India.</p>
          </div>
          <button className="btn btn-ghost" onClick={() => fetchNews(page)}>
            <FaSync className={loading ? 'spinning' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : news.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FaNewspaper /></div>
            <h3>No news available</h3>
            <p className="empty-state-text">
              Configure your <code>NEWS_API_KEY</code> in the backend <code>.env</code> file to fetch live Indian legal news.
            </p>
          </div>
        ) : (
          <div className="news-grid">
            {news.map((article, i) => (
              <a
                key={article._id || i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
              >
                {article.urlToImage && (
                  <div className="news-image">
                    <img src={article.urlToImage} alt={article.title} onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                {!article.urlToImage && (
                  <div className="news-image-placeholder"><FaNewspaper /></div>
                )}
                <div className="news-body">
                  <div className="news-source">
                    <span className="badge badge-blue">{article.category}</span>
                    <span className="news-src-name">{article.source}</span>
                  </div>
                  <h3 className="news-title">{article.title}</h3>
                  {article.description && (
                    <p className="news-desc">{article.description}</p>
                  )}
                  <div className="news-footer">
                    <span className="news-date">
                      <FaCalendarAlt />
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                    </span>
                    <span className="news-read-more">
                      Read More <FaExternalLinkAlt />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseSurfing;
