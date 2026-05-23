function LinkCard({
  link,
  selectedSort,
  relativeTime,
  onOpen,
  onEdit,
  onToggleFavorite,
  onDelete,
}) {
  return (
    <article
      className="link-card capsule-card"
      onClick={() => onOpen(link)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(link)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="capsule-head">
        <img src={link.iconUrl} alt="" className="link-icon" />
        <div className="capsule-title-group">
          <h4>{link.title}</h4>
          <a
            href={link.url}
            onClick={(event) => {
              event.preventDefault()
            }}
          >
            {link.url}
          </a>
        </div>
      </div>

      <div className="capsule-pills">
        <span>{link.category}</span>
        <span>{link.clickCount} clicks</span>
        <span>{relativeTime(link.lastOpenedAt)}</span>
        {selectedSort === 'smart' && <span>Score {link.smartScore}</span>}
      </div>

      <div className="capsule-extra">
        <div className="capsule-pills capsule-detail-pills">
          {link.description && <span className="capsule-text-pill">{link.description}</span>}
          {link.tags && <span className="capsule-text-pill tags-pill">{link.tags}</span>}
        </div>

        <div className="capsule-actions">
          <button
            type="button"
            className="capsule-action"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(link)
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="capsule-action"
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(link)
            }}
          >
            {link.favorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button
            type="button"
            className="capsule-action capsule-action-danger"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(link.id)
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default LinkCard
