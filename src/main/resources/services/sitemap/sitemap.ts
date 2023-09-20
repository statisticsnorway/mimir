import { query } from '/lib/xp/content'
import { getSiteConfig, attachmentUrl } from '/lib/xp/portal'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

exports.get = () => {
  const sitemapXmlAppConfigQuery = query({
    start: 0,
    count: 2,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'data.siteConfig.applicationKey',
              values: ['com.enonic.app.sitemapxml'],
            },
          },
        ],
      },
    },
  }).hits[0] as unknown as SitemapXmlAppConfig

  // const sitemapXmlAppConfig =
  //   sitemapXmlAppConfigQuery.data.siteConfig.find((config) => config.applicationKey === 'com.enonic.app.sitemapxml')
  //     ?.config ?? []

  const sitemapXmlAppConfig = getSiteConfig<XP.SiteConfig>()?.sitemapXmlMediaSelector ?? []

  const sitemapXmlAppConfigUrls = query({
    start: 0,
    count: sitemapXmlAppConfig.length + 1,
    filters: {
      ids: {
        values: forceArray(sitemapXmlAppConfig).map((id) => id),
      },
    },
  }).hits.map((content) => {
    return {
      url: attachmentUrl({
        id: content._id,
        type: 'absolute',
      }),
      lastModified: content.modifiedTime.split('T')[0],
    }
  })

  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapXmlAppConfigUrls
      .map(({ url, lastModified }) => {
        return `<sitemap>
            <loc>${url}</loc>
            <lastmod>${lastModified}</lastmod>
          </sitemap>`
      })
      .join('')}
  </sitemapindex>`

  return {
    contentType: 'text/xml',
    body,
  }
}

type SitemapXmlAppConfig = {
  data: {
    siteConfig: [{ applicationKey: string; config: object }]
  }
}
