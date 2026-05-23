function Header({
  theme,
  onAddLink,
  onToggleTheme,
}) {
  return (
    <header className="top-header">
        <>QuickLink Dashboard</>
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
