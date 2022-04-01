import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import {SiteConfig} from "../../site-config";

const {
  getContent,
  getSiteConfig
} = __non_webpack_require__('/lib/xp/portal')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const page: Content = getContent()

  const pageLanguage: string = page.language ? page.language : 'nb'

  const siteConfig: SiteConfig = getSiteConfig()
  const statbankHelpLink: string = siteConfig.statbankHelpLink

  const statbankHelpText: string = localize({
    key: 'statbankHelpText',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })
  const statbankFrontPage: string = localize({
    key: 'statbankFrontPage',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })


  const testCrumbs: Array<object> = [{
    text: 'Forsiden',
    link: '/'
  }, {
    text: 'Statistikkbanken',
    link: '/statbank'
  }]

  const props: PartProperties = {
    title: 'Statistikkbanken',
    breadcrumb: testCrumbs,
    statbankHelpText,
    statbankFrontPage,
    statbankHelpLink
  }

  return React4xp.render('site/parts/statbankFrame/statbankFrame', props, req)
}

interface PartProperties {
    title: string;
    breadcrumb: Array<object>;
    statbankHelpText: string;
    statbankFrontPage: string;
    statbankHelpLink: string;
}
