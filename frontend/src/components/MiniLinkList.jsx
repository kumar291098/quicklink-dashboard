function MiniLinkList({ title, eyebrow, emptyMessage, items, subtitle, onOpen }) {
  return (
    <section className="section-block compact-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="mini-grid">
        {items.length === 0 ? (
          <div className="empty-card">{emptyMessage}</div>
        ) : (
          items.map((link) => (
            <button key={link.id} type="button" className="mini-card" onClick={() => onOpen(link)}>
              <img src={link.iconUrl} alt="" />
              <div>
                <strong>{link.title}</strong>
                <span>{subtitle(link)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

export default MiniLinkList
