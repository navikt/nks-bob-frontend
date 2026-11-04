export function buildWebSocketUrl(path: string): string {
  const base = `${import.meta.env.BASE_URL}bob-api-ws`
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}${base}${path}`
}
