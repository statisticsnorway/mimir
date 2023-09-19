import { query } from '/lib/xp/content'
// import { attachmentUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'

const view = resolve('./sitemap.xsl')

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

  log.info(JSON.stringify(sitemapXmlAppConfig, null, 2))

  // TODO: Generate new sitemap xml including links in sitemap xml app config
  const model = {}
  return {
    contentType: 'text/xml',
    body: render(view, model),
  }
}

type SitemapXmlAppConfig = {
  data: {
    siteConfig: [{ applicationKey: string; config: object }]
  }
}
