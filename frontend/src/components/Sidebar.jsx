function Sidebar({
  activeNavKey,
  categories,
  showFavoritesOnly,
  selectedCategory,
  selectedSort,
  sortOptions,
  onSelectAllLinks,
  onToggleFavorites,
  onSelectCategory,
  onSortChange,
}) {
  return (
    <section className="sidebar filters-panel">
      <div 
        className="company-recognition-card"
        style={{
          padding: '16px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/codinghelp-icon.svg" 
            alt="CodingHelp Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '10px' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-h)' }}>CodingHelp</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>YouTube Channel</span>
          </div>
        </div>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, lineHeight: '1.4' }}>
          Learn Data Structures, Algorithms, and coding solutions with simple explanations.
        </p>

        <a
          href="https://www.youtube.com/@CodingHelp-m5w"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#ff0000',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '0.78rem',
            fontWeight: '600',
            textAlign: 'center',
            transition: 'background 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#cc0000';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ff0000';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>Subscribe on YouTube</span>
        </a>
      </div>

      <div className="sidebar-head">
        <p className="eyebrow">Quick filters</p>
        <h2>Browse</h2>
      </div>

      <div className="bottom-filter-controls">
        <select
          className="sort-select"
          value={selectedSort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-slider" aria-hidden="true" />
        <button
          type="button"
          className={activeNavKey === 'All Links' ? 'nav-chip active' : 'nav-chip'}
          onClick={onSelectAllLinks}
        >
          All Links
        </button>
        <button
          type="button"
          className={showFavoritesOnly ? 'nav-chip active' : 'nav-chip'}
          onClick={onToggleFavorites}
        >
          Favorites
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category && !showFavoritesOnly ? 'nav-chip active' : 'nav-chip'}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>
    </section>
  )
}

export default Sidebar
