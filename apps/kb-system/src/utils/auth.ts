const TOKEN_KEY = 'api_token'

export function getToken(): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')
  if (urlToken) {
    setToken(urlToken)
    urlParams.delete('token')
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, '', newUrl)
    return urlToken
  }
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
