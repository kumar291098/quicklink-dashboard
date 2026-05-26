const API_BASE =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:58085'
    : ''

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function fetchLinksRequest({
  selectedSort,
  selectedCategory,
  deferredSearchTerm,
  showFavoritesOnly,
}) {
  const params = new URLSearchParams()
  params.set('sort', selectedSort)

  if (selectedCategory !== 'All Links') {
    params.set('category', selectedCategory)
  }

  if (deferredSearchTerm.trim()) {
    params.set('search', deferredSearchTerm.trim())
  }

  if (showFavoritesOnly) {
    params.set('favoritesOnly', 'true')
  }

  return fetchJson(`/api/links?${params.toString()}`)
}
