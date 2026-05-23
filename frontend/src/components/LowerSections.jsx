import MiniLinkList from './MiniLinkList'

function LowerSections({ analytics, favoriteLinks, recentLinks, relativeTime, onOpen }) {
  return (
    <section className="hero-grid lower-sections">
      <div className="analytics-grid">
        <div className="stat-card accent">
          <span>Total links</span>
          <strong>{analytics?.totalLinks ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Most opened</span>
          <strong>{analytics?.mostOpenedTitle ?? 'Loading...'}</strong>
        </div>
        <div className="stat-card">
          <span>Top category</span>
          <strong>{analytics?.topCategory ?? 'Loading...'}</strong>
        </div>
        <div className="stat-card">
          <span>Opened today</span>
          <strong>{analytics?.linksOpenedToday ?? 0}</strong>
        </div>
      </div>

      <div className="stacked-sections">
        <MiniLinkList
          title="Favorite links"
          eyebrow="High priority"
          emptyMessage="Favorite links will show up here."
          items={favoriteLinks}
          subtitle={(link) => link.category}
          onOpen={onOpen}
        />
        <MiniLinkList
          title="Recently used"
          eyebrow="Smart recency"
          emptyMessage="Open a link and it will appear here."
          items={recentLinks}
          subtitle={(link) => relativeTime(link.lastOpenedAt)}
          onOpen={onOpen}
        />
      </div>
    </section>
  )
}

export default LowerSections
