const DASHBOARD_SETTINGS_KEY = 'quicklink-dashboard-settings'
const LINK_DRAFT_KEY = 'quicklink-link-draft'

const defaultSettings = {
  searchTerm: '',
  selectedCategory: 'All Links',
  selectedSort: 'smart',
  showFavoritesOnly: false,
  theme: 'light',
}

function parseStoredValue(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) {
      return fallback
    }

    return {
      ...fallback,
      ...JSON.parse(rawValue),
    }
  } catch {
    return fallback
  }
}

export function loadDashboardSettings() {
  if (typeof window === 'undefined') {
    return defaultSettings
  }

  return parseStoredValue(DASHBOARD_SETTINGS_KEY, defaultSettings)
}

export function saveDashboardSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DASHBOARD_SETTINGS_KEY, JSON.stringify(settings))
}

export function loadLinkDraft(emptyForm) {
  if (typeof window === 'undefined') {
    return {
      form: emptyForm,
      editingId: null,
      isEditorOpen: false,
    }
  }

  return parseStoredValue(LINK_DRAFT_KEY, {
    form: emptyForm,
    editingId: null,
    isEditorOpen: false,
  })
}

export function saveLinkDraft(draft) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LINK_DRAFT_KEY, JSON.stringify(draft))
}

export function clearLinkDraft() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LINK_DRAFT_KEY)
}
