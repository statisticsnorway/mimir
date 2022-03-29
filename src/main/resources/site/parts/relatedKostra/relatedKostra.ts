import { Request, Response } from 'enonic-types/controller'
import { MunicipalityWithCounty } from '../../../lib/ssb/dataset/klass/municipalities'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { SiteConfig } from '../../site-config'
import { RelatedKostraPartConfig } from './relatedKostra-part-config'

const {
  getComponent,
  getSiteConfig,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getMunicipality
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  pageMode
} = __non_webpack_require__('/lib/ssb/utils/utils')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req: Request): Response | React4xpResponse {
  try {
    let municipality: MunicipalityWithCounty | undefined = getMunicipality(req)
    const mode: string = pageMode(req)
    if (!municipality && mode === 'edit') {
      const siteConfig: SiteConfig = getSiteConfig()
      municipality = getMunicipality({
        code: siteConfig.defaultMunicipality
      } as unknown as Request)
    }
    return renderPart(req, municipality)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = function(req: Request): Response | React4xpResponse {
  const siteConfig: SiteConfig = getSiteConfig()
  const municipality: MunicipalityWithCounty | undefined = getMunicipality({
    code: siteConfig.defaultMunicipality
  } as unknown as Request)
  return renderPart(req, municipality)
}

function renderPart(req: Request, municipality: MunicipalityWithCounty | undefined): Response | React4xpResponse {
  const config: RelatedKostraPartConfig = getComponent().config

  const props: RelatedKostraProps = {
    title: config.title,
    description: config.description ? processHtml({
      value: config.description.replace(/.&nbsp;/g, ' ')
    }) : '',
    href: municipality ? config.kostraLink + (municipality.path == null ? '' : municipality.path) : '',
    children: config.kostraLinkText,
    linkType: 'profiled'
  }

  return React4xp.render('site/parts/relatedKostra/relatedKostra', props, req)
}

interface RelatedKostraProps {
  title: string;
  description: string;
  href: string;
  children: string;
  linkType: string;
}
