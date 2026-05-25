function Header({
  theme,
  searchTerm,
  onAddLink,
  onSearchChange,
  onToggleTheme,
}) {
  return (
    <header className="top-header">
      <div className="top-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.reload()}>
        <img src="./codinghelp-icon.svg" alt="CodingHelp Logo" style={{ width: '32px', height: '32px' }} />
        <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>CodingHelp Dashboard</span>
      </div>
      <div className="top-header-search">
        <input
          className="search-input top-search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title, URL, tag, category, or description"
        />
      </div>
      <div className="toolbar-controls">
        <a
          href="https://www.youtube.com/@CodingHelp-m5w"
          target="_blank"
          rel="noopener noreferrer"
          className="youtube-channel-button"
          title="Visit CodingHelp on YouTube"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ff0000',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '14px',
            fontSize: '0.82rem',
            fontWeight: '600',
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube</span>
        </a>
        <button type="button" className="ghost-button theme-button" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button type="button" className="primary-button add-link-button" onClick={onAddLink}>
          Add Link
        </button>
      </div>
    </header>
  )
}

export default Header
