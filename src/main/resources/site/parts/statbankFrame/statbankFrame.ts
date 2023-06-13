import { render } from '/lib/enonic/react4xp'
import { getContent, getSiteConfig } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent()
  if (!page) throw Error('No page found')

  const pageLanguage: string = page.language ? page.language : 'nb'

  const siteConfig = getSiteConfig<XP.SiteConfig>()
  if (!siteConfig) throw Error('No site config found')

  const statbankHelpLink: string = siteConfig.statbankHelpLink

  const statbankHelpText: string = localize({
    key: 'statbankHelpText',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage,
  })
  const statbankFrontPage: string = localize({
    key: 'statbankFrontPage',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage,
  })

  const testCrumbs: Array<object> = [
    {
      text: 'Forsiden',
      link: '/',
    },
    {
      text: 'Statistikkbanken',
      link: '/statbank',
    },
  ]

  const props: PartProperties = {
    title: 'Statistikkbanken',
    breadcrumb: testCrumbs,
    statbankHelpText,
    statbankFrontPage,
    statbankHelpLink,
  }

  return render('site/parts/statbankFrame/statbankFrame', props, req)
}

interface PartProperties {
  title: string
  breadcrumb: Array<object>
  statbankHelpText: string
  statbankFrontPage: string
  statbankHelpLink: string
}
