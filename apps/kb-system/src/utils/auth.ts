const TOKEN_KEY = 'api_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
  return !!getToken()
}

export function extractTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  if (token) {
    setToken(token)
    urlParams.delete('token')
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, '', newUrl)
    return token
  }
  return null
}
