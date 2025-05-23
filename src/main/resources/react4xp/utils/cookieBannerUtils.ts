/// <reference lib="dom" />

const KEEP = ['enonicXpReturnToUrl', 'hidePopup', 'JSESSIONID', 'X-Identity', 'cookie-consent']

// Deletes all non-essential cookies by name across possible domain variants.
// Ensures 'cookie-consent' and other KEEP-listed cookies are preserved.
export function blockOptionalCookies(): void {
  const hostname = window.location.hostname
  const base = hostname.replace(/^www\./, '')

  document.cookie
    .split(';')
    .map((c) => c.trim())
    .forEach((c) => {
      const name = c.split('=')[0]
      if (!KEEP.includes(name)) {
        const domains = ['', `; domain=${hostname}`, `; domain=.${base}`]
        domains.forEach((suffix) => {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${suffix}`
        })
      }
    })
}

// Deletes only the 'cookie-consent' cookie from all domain variants
export function deleteCookieConsent(): void {
  const name = 'cookie-consent'
  const hostname = window.location.hostname
  const base = hostname.replace(/^www\./, '')

  const domains = ['', `; domain=${hostname}`, `; domain=.${base}`]

  domains.forEach((suffix) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${suffix}`
  })
}
