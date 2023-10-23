import type { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'
import { render } from '/lib/enonic/react4xp'
import { getComponent, getSiteConfig, processHtml } from '/lib/xp/portal'

const { getMunicipality } = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const { pageMode } = __non_webpack_require__('/lib/ssb/utils/utils')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response {
  try {
    let municipality: MunicipalityWithCounty | undefined = getMunicipality(req)
    const mode: string = pageMode(req)
    if (!municipality && mode === 'edit') {
      const siteConfig = getSiteConfig<XP.SiteConfig>()
      if (!siteConfig) throw Error('No site config found')

      municipality = getMunicipality({
        code: siteConfig.defaultMunicipality,
      } as unknown as XP.Request)
    }
    return renderPart(req, municipality)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  const siteConfig = getSiteConfig<XP.SiteConfig>()
  if (!siteConfig) throw Error('No site config found')

  const municipality: MunicipalityWithCounty | undefined = getMunicipality({
    code: siteConfig.defaultMunicipality,
  } as unknown as XP.Request)
  return renderPart(req, municipality)
}

function renderPart(req: XP.Request, municipality: MunicipalityWithCounty | undefined): XP.Response {
  const config = getComponent<XP.PartComponent.RelatedKostra>()?.config
  if (!config) throw Error('No part found')

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
