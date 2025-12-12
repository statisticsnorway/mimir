import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'
import { getAboutTheStatisticsProps } from '/lib/ssb/parts/statisticDescription'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { AboutTheStatisticsProps } from '/lib/types/partTypes/omStatistikken'
import { type Statistics } from '/site/content-types'

export function get(req: Request): Response {
  try {
    const statisticPage = getContent<Content<Statistics>>()
    if (!statisticPage) throw Error('No page found')

    return renderPart(req, statisticPage.data.aboutTheStatistics)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request, id: string | undefined): Response {
  return renderPart(req, id)
}

function renderPart(req: Request, aboutTheStatisticsId: string | undefined): Response {
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
function getOmStatistikken(req: Request, page: Content<any>, aboutTheStatisticsId: string | undefined): Response {
  const props: AboutTheStatisticsProps = getAboutTheStatisticsProps(req, page, aboutTheStatisticsId)

  return render('site/parts/statisticDescription/statisticDescription', props, req, {
    body: `<section id="om-statistikken" class="xp-part statistic-description container"></section>`,
    id: 'statistic-description',
  })
}
