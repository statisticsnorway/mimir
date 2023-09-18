import { query } from '/lib/xp/content'
// import { attachmentUrl } from '/lib/xp/portal'

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

  const sitemapXmlAppConfig =
    sitemapXmlAppConfigQuery.data.siteConfig.find((config) => config.applicationKey === 'com.enonic.app.sitemapxml')
      ?.config ?? {}

  /* TODO: Generate new sitemap xml including links in sitemap xml app config
   * Fetch sitemap xml from sitemap xml app from repo?
   * Merge sitemap.xml from sitemap xml app with xml generated from service to sitemapindex.xml
   * Return result to body
   */

  return {
    contentType: 'text/json',
    body: JSON.stringify(sitemapXmlAppConfig, null, 2),
  }
}

type SitemapXmlAppConfig = {
  data: {
    siteConfig: [{ applicationKey: string; config: object }]
  }
}
