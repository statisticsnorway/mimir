import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { Content } from '/lib/xp/content'
import { getContent, getSiteConfig } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

export function get(req: XP.Request): RenderResponse {
  return renderPart(req)
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const page: Content = getContent()

  const pageLanguage: string = page.language ? page.language : 'nb'

  const siteConfig: XP.SiteConfig = getSiteConfig()
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
