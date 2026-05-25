import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import LinkEditor from './components/LinkEditor'
import LinksSection from './components/LinksSection'
import LowerSections from './components/LowerSections'
import Sidebar from './components/Sidebar'
import { emptyForm, sortOptions } from './constants'
import { fetchJson, fetchLinksRequest } from './utils/api'
import {
  clearLinkDraft,
  loadDashboardSettings,
  loadLinkDraft,
  saveDashboardSettings,
  saveLinkDraft,
} from './utils/storage'
import { relativeTime } from './utils/time'

function App() {
  const dashboardSettings = loadDashboardSettings()
  const initialDraft = loadLinkDraft(emptyForm)
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState([])
  const [recentLinks, setRecentLinks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [searchTerm, setSearchTerm] = useState(dashboardSettings.searchTerm)
  const [selectedCategory, setSelectedCategory] = useState(dashboardSettings.selectedCategory)
  const [selectedSort, setSelectedSort] = useState(dashboardSettings.selectedSort)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(dashboardSettings.showFavoritesOnly)
  const [theme, setTheme] = useState(dashboardSettings.theme ?? 'light')
  const [form, setForm] = useState(initialDraft.form)
  const [editingId, setEditingId] = useState(initialDraft.editingId)
  const [isEditorOpen, setIsEditorOpen] = useState(initialDraft.isEditorOpen)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  useEffect(() => {
    saveDashboardSettings({
      searchTerm,
      selectedCategory,
      selectedSort,
      showFavoritesOnly,
      theme,
    })
  }, [searchTerm, selectedCategory, selectedSort, showFavoritesOnly, theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    saveLinkDraft({
      form,
      editingId,
      isEditorOpen,
    })
  }, [form, editingId, isEditorOpen])

  async function loadLinksData() {
    try {
      const data = await fetchLinksRequest({
        selectedSort,
        selectedCategory,
        deferredSearchTerm,
        showFavoritesOnly,
      })
      startTransition(() => setLinks(data))
    } catch {
      setError('Could not refresh links.')
    }
  }

  useEffect(() => {
    let active = true

    queueMicrotask(() => {
      void (async () => {
        try {
          setLoading(true)
          setError('')
          const [data, categoryData, recentData, analyticsData] = await Promise.all([
            fetchLinksRequest({
              selectedSort,
              selectedCategory,
              deferredSearchTerm,
              showFavoritesOnly,
            }),
            fetchJson('/api/links/categories'),
            fetchJson('/api/links/recent?limit=4'),
            fetchJson('/api/links/analytics'),
          ])

          if (active) {
            startTransition(() => setLinks(data))
            setCategories(categoryData)
            setRecentLinks(recentData)
            setAnalytics(analyticsData)
          }
        } catch {
          if (active) {
            setError('Could not load the dashboard. Start the Spring Boot API on port 58081 and try again.')
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      })()
    })

    return () => {
      active = false
    }
  }, [selectedSort, selectedCategory, showFavoritesOnly, deferredSearchTerm])

  async function refreshPanels() {
    const [categoryData, recentData, analyticsData] = await Promise.all([
      fetchJson('/api/links/categories'),
      fetchJson('/api/links/recent?limit=4'),
      fetchJson('/api/links/analytics'),
    ])
    setCategories(categoryData)
    setRecentLinks(recentData)
    setAnalytics(analyticsData)
  }

  function updateForm(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const path = editingId ? `/api/links/${editingId}` : '/api/links'
      const method = editingId ? 'PUT' : 'POST'

      await fetchJson(path, {
        method,
        body: JSON.stringify(form),
      })

      setForm(emptyForm)
      setEditingId(null)
      setIsEditorOpen(false)
      clearLinkDraft()
      await Promise.all([loadLinksData(), refreshPanels()])
    } catch {
      setError('The link could not be saved. Please check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(link) {
    setEditingId(link.id)
    setIsEditorOpen(true)
    setForm({
      title: link.title,
      url: link.url,
      category: link.category,
      description: link.description ?? '',
      tags: link.tags ?? '',
      iconUrl: link.iconUrl ?? '',
      favorite: link.favorite,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setIsEditorOpen(false)
    clearLinkDraft()
  }

  function handleOpenCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setIsEditorOpen(true)
    setError('')
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this link?')) {
      return
    }

    try {
      await fetchJson(`/api/links/${id}`, { method: 'DELETE' })
      await Promise.all([loadLinksData(), refreshPanels()])
    } catch {
      setError('The link could not be deleted.')
    }
  }

  async function handleOpen(link) {
    try {
      const result = await fetchJson(`/api/links/${link.id}/open`, { method: 'POST' })
      if (window.quicklink?.openExternalUrl) {
        await window.quicklink.openExternalUrl(result.url)
      } else {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
      await Promise.all([loadLinksData(), refreshPanels()])
    } catch {
      setError('The link could not be opened.')
    }
  }

  async function handleToggleFavorite(link) {
    try {
      await fetchJson(`/api/links/${link.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: link.title,
          url: link.url,
          category: link.category,
          description: link.description ?? '',
          tags: link.tags ?? '',
          iconUrl: link.iconUrl ?? '',
          favorite: !link.favorite,
        }),
      })
      await Promise.all([loadLinksData(), refreshPanels()])
    } catch {
      setError('Could not update favorite status.')
    }
  }

  const favoriteLinks = links.filter((link) => link.favorite).slice(0, 4)
  const activeNavKey = showFavoritesOnly ? 'favorites' : selectedCategory

  return (
    <div className="page-shell">
      <Header
        theme={theme}
        searchTerm={searchTerm}
        onAddLink={handleOpenCreate}
        onSearchChange={setSearchTerm}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <div className="app-shell">
        <main className="main-panel">
          {isEditorOpen && (
            <LinkEditor
              editingId={editingId}
              form={form}
              saving={saving}
              onChange={updateForm}
              onSubmit={handleSubmit}
              onCancel={handleCancelEdit}
            />
          )}

          {error && <p className="error-banner">{error}</p>}

          <LinksSection
            selectedSort={selectedSort}
            loading={loading}
            links={links}
            relativeTime={relativeTime}
            onOpen={handleOpen}
            onEdit={handleEdit}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />

          <LowerSections
            analytics={analytics}
            favoriteLinks={favoriteLinks}
            recentLinks={recentLinks}
            relativeTime={relativeTime}
            onOpen={handleOpen}
          />

          <Sidebar
            activeNavKey={activeNavKey}
            categories={categories}
            showFavoritesOnly={showFavoritesOnly}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            sortOptions={sortOptions}
            onSortChange={setSelectedSort}
            onSelectAllLinks={() => {
              setShowFavoritesOnly(false)
              setSelectedCategory('All Links')
            }}
            onToggleFavorites={() => setShowFavoritesOnly((current) => !current)}
            onSelectCategory={(category) => {
              setShowFavoritesOnly(false)
              setSelectedCategory(category)
            }}
          />
        </main>
      </div>
    </div>
  )
}

export default App
