import axios from 'axios'

const BASE_URL = 'http://localhost:8080'
const SERVICE_PATH = '/_/service/articles'
const CURRENT_PATH = '/utenriksokonomi/utenrikshandel'
const COUNT = 9999
const SORT = 'default'
const LANGUAGE = 'nb'

// Define the expected structure of each article
type Article = {
  url?: string
  href?: string
}

export function get() {
  return axios
    .get(`${BASE_URL}${SERVICE_PATH}`, {
      params: {
        currentPath: CURRENT_PATH,
        start: 0,
        count: COUNT,
        sort: SORT,
        language: LANGUAGE,
      },
      headers: {
        Accept: 'application/json',
      },
    })
    .then((res) => {
      const articles: Article[] = res.data.articles || []
      const urls: string[] = articles
        .map((a: Article) => a.url || a.href)
        .filter((u: string | undefined): u is string => Boolean(u))

      const html = `
        <html>
          <head><title>Article URLs</title></head>
          <body>
            <h1>Found ${urls.length} article URLs</h1>
            <ul>
              ${urls.map((u: string) => `<li><a href="${BASE_URL + u}">${BASE_URL + u}</a></li>`).join('\n')}
            </ul>
          </body>
        </html>
      `

      return {
        status: 200,
        contentType: 'text/html',
        body: html,
      }
    })
    .catch((err: unknown) => {
      return {
        status: 500,
        body: 'Failed to fetch articles: ' + (err instanceof Error ? err.message : String(err)),
      }
    })
}
