import { Content } from 'enonic-types/content'
import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { Statistics } from '../../content-types/statistics/statistics'
import { StatbankBoxPartConfig } from './statbankBox-part-config'

const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getContent,
  getComponent,
  assetUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')


const STATBANKWEB_URL: string = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./statbankBox.html')

exports.get = function(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: Request): Response => renderPart(req)

function renderPart(req: Request): Response {
  const page: Content<Statistics> = getContent()
  const config: StatbankBoxPartConfig = getComponent().config
  const phrases: Phrases = getPhrases(page)

  const isNotInEditMode: boolean = req.mode !== 'edit'
  return renderStatbankBox(parseStatbankBoxContent(page, config, phrases), isNotInEditMode)
}

function renderStatbankBox(statbankBoxContent: StatbankBoxProps, isNotInEditMode: boolean): Response {
  const statbankBoxComponent: React4xpObject = new React4xp('StatbankBox')
    .setProps({
      ...statbankBoxContent
    })
    .uniqueId()

  const body: string = render(view, {
    statbankBoxId: statbankBoxComponent.react4xpId
  })

  return {
    body: statbankBoxComponent.renderBody({
      body,
      clientRender: isNotInEditMode
    }),
    pageContributions: statbankBoxComponent.renderPageContributions({
      clientRender: isNotInEditMode
    }) as PageContributions
  }
}

function parseStatbankBoxContent(page: Content<Statistics>, config: StatbankBoxPartConfig, phrases: Phrases): StatbankBoxProps {
  const statistic: StatisticInListing | undefined = (page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)) as StatisticInListing | undefined
  const shortName: string | undefined = statistic && statistic.shortName ? statistic.shortName : undefined

  const overrideTitle: string | undefined = config.title
  const fullWidth: boolean = config.fullWidthCheckBox
  let title: string | undefined
  if (overrideTitle) {
    title = overrideTitle
  } else if (fullWidth) {
    title = phrases['statbankBox.alt.title']
  } else {
    title = phrases['statbankBox.title']
  }

  const overrideUrl: string | undefined = config.href
  let href: string | undefined
  if (overrideUrl) {
    href = overrideUrl
  } else if (shortName) {
    href = `${STATBANKWEB_URL}/list/${shortName}`
  } else {
    href = `${STATBANKWEB_URL}/`
  }

  if (!overrideUrl && page.language === 'en') {
    href = href.replace('/statbank/', '/en/statbank/')
  }

  return {
    title,
    href: href,
    icon: assetUrl({
      path: 'SSB_ikon_statbank.svg'
    }),
    fullWidth
  }
}

interface StatbankBoxProps {
  title: string;
  href: string;
  icon: string;
  fullWidth: boolean;
}
