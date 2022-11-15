import type { MunicipalityWithCounty } from '../../../lib/ssb/dataset/klass/municipalities'
import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { SiteConfig } from '../../site-config'
import type { RelatedKostraPartConfig } from './relatedKostra-part-config'
import { getComponent, getSiteConfig, processHtml } from '/lib/xp/portal'

const { getMunicipality } = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const { pageMode } = __non_webpack_require__('/lib/ssb/utils/utils')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response | RenderResponse {
  try {
    let municipality: MunicipalityWithCounty | undefined = getMunicipality(req)
    const mode: string = pageMode(req)
    if (!municipality && mode === 'edit') {
      const siteConfig: SiteConfig = getSiteConfig()
      municipality = getMunicipality({
        code: siteConfig.defaultMunicipality,
      } as unknown as XP.Request)
    }
    return renderPart(req, municipality)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request): XP.Response | RenderResponse {
  const siteConfig: SiteConfig = getSiteConfig()
  const municipality: MunicipalityWithCounty | undefined = getMunicipality({
    code: siteConfig.defaultMunicipality,
  } as unknown as XP.Request)
  return renderPart(req, municipality)
}

function renderPart(req: XP.Request, municipality: MunicipalityWithCounty | undefined): XP.Response | RenderResponse {
  const config: RelatedKostraPartConfig = getComponent().config

  const props: RelatedKostraProps = {
    title: config.title,
    description: config.description
      ? processHtml({
          value: config.description.replace(/.&nbsp;/g, ' '),
        })
      : '',
    href: municipality ? config.kostraLink + (municipality.path == null ? '' : municipality.path) : '',
    children: config.kostraLinkText,
    linkType: 'profiled',
  }

  return render('site/parts/relatedKostra/relatedKostra', props, req)
}

interface RelatedKostraProps {
  title: string
  description: string
  href: string
  children: string
  linkType: string
}
