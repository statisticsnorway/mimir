import { render, RenderResponse } from '/lib/enonic/react4xp'
import { Content } from '/lib/xp/content'
import { SiteConfig } from '../../site-config'

const { getContent, getSiteConfig } = __non_webpack_require__('/lib/xp/portal')
const { localize } = __non_webpack_require__('/lib/xp/i18n')

exports.get = (req: XP.Request): RenderResponse => {
  return renderPart(req)
}

exports.preview = (req: XP.Request): RenderResponse => renderPart(req)

function renderPart(req: XP.Request): RenderResponse {
  const page: Content = getContent()

  const pageLanguage: string = page.language ? page.language : 'nb'

  const siteConfig: SiteConfig = getSiteConfig()
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
