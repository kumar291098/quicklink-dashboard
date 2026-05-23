function LinkEditor({ editingId, form, saving, onChange, onSubmit, onCancel }) {
  return (
    <section className="section-block editor-panel">
      <form className="editor-card inline-editor" onSubmit={onSubmit}>
        <div className="card-header">
          <div>
            <p className="eyebrow">{editingId ? 'Update link' : 'Add a new link'}</p>
            <h3>{editingId ? 'Edit existing shortcut' : 'Create your next shortcut'}</h3>
          </div>
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        </div>

        <div className="form-grid">
          <label>
            Title
            <input name="title" value={form.title} onChange={onChange} required />
          </label>
          <label>
            URL
            <input name="url" type="url" value={form.url} onChange={onChange} required />
          </label>
          <label>
            Category
            <input name="category" value={form.category} onChange={onChange} required />
          </label>
          <label>
            Icon URL
            <input name="iconUrl" value={form.iconUrl} onChange={onChange} placeholder="Optional" />
          </label>
          <label className="full-width">
            Description
            <textarea name="description" rows="3" value={form.description} onChange={onChange} />
          </label>
          <label className="full-width">
            Tags
            <input name="tags" value={form.tags} onChange={onChange} placeholder="java, backend, jobs" />
          </label>
        </div>

        <label className="checkbox-row">
          <input
            name="favorite"
            type="checkbox"
            checked={form.favorite}
            onChange={onChange}
          />
          Mark as favorite
        </label>

        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Update link' : 'Add link'}
        </button>
      </form>
    </section>
  )
}

export default LinkEditor
