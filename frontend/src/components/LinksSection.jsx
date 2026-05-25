import LinkCard from './LinkCard'

function LinksSection({
  selectedSort,
  loading,
  links,
  relativeTime,
  onOpen,
  onEdit,
  onToggleFavorite,
  onDelete,
}) {
  const useCompactCards = true

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ranked by {selectedSort.replace('-', ' ')}</p>
          <h3>All links</h3>
        </div>
        <span className="result-count">
          {loading ? 'Loading...' : `${links.length} result${links.length === 1 ? '' : 's'}`}
        </span>
      </div>

      <div className="link-grid link-grid-compact">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            selectedSort={selectedSort}
            compact={useCompactCards}
            relativeTime={relativeTime}
            onOpen={onOpen}
            onEdit={onEdit}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        ))}

        {!loading && links.length === 0 && (
          <div className="empty-card wide">
            No links matched this search and filter combination.
          </div>
        )}
      </div>
    </section>
  )
}

export default LinksSection
