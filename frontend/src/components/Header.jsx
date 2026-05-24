function Header({
  theme,
  searchTerm,
  onAddLink,
  onSearchChange,
  onToggleTheme,
}) {
  return (
    <header className="top-header">
      <div className="top-header-brand">QuickLink Dashboard</div>
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
