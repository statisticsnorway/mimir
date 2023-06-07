import { render as r4XpRender, type RenderResponse } from '/lib/enonic/react4xp'
import { getComponent, getContent } from '/lib/xp/portal'
import type { EntryLinks as EntryLinksPartConfig } from '.'
import { type Content, get as getContentByKey } from '/lib/xp/content'
import type { Phrases } from '/lib/types/language'
import { render } from '/lib/thymeleaf'
import { imageUrl } from '/lib/ssb/utils/imageUtils'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getAttachmentContent } = __non_webpack_require__('/lib/ssb/utils/utils')

const view = resolve('./entryLinks.html')

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response | RenderResponse {
  const page = getContent()
  if (!page) throw Error('No page found')

  const part = getComponent<EntryLinksPartConfig>()
  if (!part) throw Error('No part found')

  const phrases: Phrases = getPhrases(page) as Phrases

  const entryLinksContent: EntryLinksPartConfig['entryLinks'] = part.config.entryLinks
    ? forceArray(part.config.entryLinks)
    : []
  const headerTitle: string = phrases.entryLinksTitle
  if (entryLinksContent.length === 0) {
    if (req.mode === 'edit') {
      return {
        body: render(view, {
          headerTitle,
        }),
      }
    }
  }

  return renderEntryLinks(req, headerTitle, entryLinksContent)
}

function renderEntryLinks(
  req: XP.Request,
  headerTitle: string,
  entryLinksContent: EntryLinksPartConfig['entryLinks']
): RenderResponse {
  if (entryLinksContent && entryLinksContent.length > 0) {
    return r4XpRender(
      'EntryLinks',
      {
        headerTitle,
        entryLinks: parseEntryLinks(entryLinksContent),
      },
      req,
      {
        id: 'entry-links',
        body: render(view, {
          entryLinksId: 'entry-links',
        }),
      }
    )
  } else {
    return {
      body: '',
      pageContributions: {},
    }
  }
}

function parseEntryLinks(entryLinksContent: EntryLinksPartConfig['entryLinks']): Array<LinkEntry> | undefined {
  return (
    entryLinksContent &&
    entryLinksContent.map(({ title, href, icon, mobileIcon }) => {
      const iconData: Content<MediaImage> | null = getContentByKey({
        key: icon,
      })

      let altText: string
      if (iconData && iconData.data.altText) {
        altText = iconData.data.altText
      }
      if (iconData && iconData.data.caption) {
        altText = iconData.data.caption
      }
      altText = ''

      return {
        title,
        href,
        icon: imageUrl({
          id: icon,
          scale: 'block(80,80)',
          format: 'jpg',
        }),
        mobileIcon: getAttachmentContent(mobileIcon),
        altText,
      }
    })
  )
}

interface LinkEntry {
  title: string
  href: string
  icon: string
  mobileIcon?: string
  altText: string
}
