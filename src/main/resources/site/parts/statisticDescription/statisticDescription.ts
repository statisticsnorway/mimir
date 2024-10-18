import { type Content } from '/lib/xp/content'
import { getContent, assetUrl } from '/lib/xp/portal'
import { getAboutTheStatisticsProps } from '/lib/ssb/parts/statisticDescription'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { AboutTheStatisticsProps } from '/lib/types/partTypes/omStatistikken'
import { type Statistics } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    const statisticPage = getContent<Content<Statistics>>()
    if (!statisticPage) throw Error('No page found')

    return renderPart(req, statisticPage.data.aboutTheStatistics)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string | undefined): XP.Response {
  return renderPart(req, id)
}

function renderPart(req: XP.Request, aboutTheStatisticsId: string | undefined): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  if (!aboutTheStatisticsId) {
    return {
      body: null,
    }
  } else if (req.mode === 'edit' || req.mode === 'inline' || req.mode === 'preview') {
    return getOmStatistikken(req, page, aboutTheStatisticsId)
  } else {
    return fromPartCache(req, `${page._id}-omStatistikken`, () => {
      return getOmStatistikken(req, page, aboutTheStatisticsId)
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOmStatistikken(req: XP.Request, page: Content<any>, aboutTheStatisticsId: string | undefined): XP.Response {
  const props: AboutTheStatisticsProps = getAboutTheStatisticsProps(req, page, aboutTheStatisticsId)

  return render(
    'site/parts/statisticDescription/statisticDescription',
    {
      ...props,
      icon: assetUrl({
        path: 'SSB_ikon_statisticDescription.svg',
      }),
    },
    req,
    {
      body: `<section id="om-statistikken" class="xp-part statistic-description container-fluid"></section>`,
      id: 'statistic-description',
    }
  )
}
