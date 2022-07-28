import { get, Content, MediaImage } from '/lib/xp/content'
import { ResourceKey, render } from '/lib/thymeleaf'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { SEO } from '../../../services/news/news'
import { Statistics } from '../../content-types/statistics/statistics'
import { StandardCardsListPartConfig } from './standardCardsList-part-config'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getComponent,
  imageUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getImageCaption,
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  hasPath
} = __non_webpack_require__('/lib/vendor/ramda')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('standardCardsList.html')

exports.get = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
  const config: StandardCardsListPartConfig = getComponent().config
  const standardCardsListConfig: StandardCardsListPartConfig['statisticsItemSet'] = config.statisticsItemSet ? forceArray(config.statisticsItemSet) : []

  const statisticsTitle: string | undefined = config.title

  if (!standardCardsListConfig.length && req.mode === 'edit') {
    return {
      body: render(view, {
        // Title is optional. The text is just a placeholder so that the user is aware that the part is present in cases where the config is empty.
        label: statisticsTitle ? statisticsTitle : 'Liste standard kort'
      })
    }
  }

  return renderStandardCardsList(statisticsTitle, parseContent(standardCardsListConfig))
}

function renderStandardCardsList(statisticsTitle: string | undefined, standardCardsListContent: StandardCardsListPartConfig['statisticsItemSet']): XP.Response {
  if (standardCardsListContent && standardCardsListContent.length) {
    const standardCardsComponent: React4xpObject = new React4xp('StatisticsCards')
      .setProps({
        headerTitle: statisticsTitle,
        statistics: standardCardsListContent.map((statisticsContent) => {
          return {
            ...statisticsContent
          }
        })
      })
      .uniqueId()

    const body: string = render(view, {
      standardCardsListComponentId: standardCardsComponent.react4xpId,
      statisticsTitle
    })

    return {
      body: standardCardsComponent.renderBody({
        body
      }),
      pageContributions: standardCardsComponent.renderPageContributions() as XP.PageContributions
    }
  }
  return {
    body: undefined,
    pageContributions: undefined
  }
}

function parseContent(standardCardsListContent: StandardCardsListPartConfig['statisticsItemSet']): Array<StandardCardsListProps> {
  if (standardCardsListContent && standardCardsListContent.length) {
    return standardCardsListContent.map((standardCard) => {
      const iconId: string | undefined = standardCard.icon
      const iconData: Content<MediaImage> | null = iconId ? get({
        key: iconId
      }) : null
      const iconPath: string | undefined = iconId ? imageUrl({
        id: iconId,
        scale: 'block(100, 100)'
      }) : undefined

      if (standardCard.contentXP) {
        const standardCardContentId: string = standardCard.contentXP
        const pageContent: Content<Statistics, object, SEO> | null = standardCardContentId ? get({
          key: standardCardContentId
        }) : null

        let preamble: string = ''
        if (hasPath(['x', 'com-enonic-app-metafields', 'meta-data', 'seoDescription'], pageContent) && pageContent) {
          preamble = pageContent.x['com-enonic-app-metafields']['meta-data'].seoDescription as string
        }

        return {
          icon: iconPath,
          iconAlt: iconId && iconData ? (iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId)) : '',
          title: pageContent && pageContent.displayName,
          preamble: preamble,
          href: pageUrl({
            id: standardCardContentId
          })
        }
      }

      return {
        icon: iconPath,
        iconAlt: iconId && iconData ? iconData.data.caption ? getImageCaption(iconId) : getImageAlt(iconId) : '',
        title: standardCard.title,
        preamble: standardCard.profiledText,
        href: standardCard.href
      }
    }).filter((content) => !!content) as unknown as Array<StandardCardsListProps>
  }
  return []
}

interface StandardCardsListProps {
  icon: string,
  iconAlt: string,
  title: string,
  preamble: string,
  href: string
}
