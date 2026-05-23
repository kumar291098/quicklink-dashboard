function Sidebar({
  activeNavKey,
  categories,
  showFavoritesOnly,
  selectedCategory,
  searchTerm,
  selectedSort,
  sortOptions,
  onSelectAllLinks,
  onToggleFavorites,
  onSelectCategory,
  onSearchChange,
  onSortChange,
}) {
  return (
    <section className="sidebar filters-panel">
      <div className="sidebar-head">
        <p className="eyebrow">Quick filters</p>
        <h2>Browse</h2>
      </div>

      <div className="bottom-filter-controls">
        <input
          className="search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title, URL, tag, category, or description"
        />

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
