import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent, processHtml } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { render as r4XpRender } from '/lib/enonic/react4xp'

import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { getTablesAndFigures, getFinalPageContributions } from '/lib/ssb/parts/attachmentTablesFigures'
import {
  type AttachmentTablesFiguresData,
  type AttachmentTablesFiguresProps,
} from '/lib/types/partTypes/attachmentTablesFigures'
import { type Statistics } from '/site/content-types'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request): Response {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')

  return getTablesAndFiguresComponent(page, req)
}

function getTablesAndFiguresComponent(page: Content<Statistics>, req: Request): Response {
  const phrases: Phrases = getPhrases(page) as Phrases

  const title: string = phrases.attachmentTablesFigures

  const attachmentTablesAndFigures: Array<string> = page.data.attachmentTablesFigures
    ? util.data.forceArray(page.data.attachmentTablesFigures)
    : []
  const attachmentTableAndFigureView: Array<AttachmentTablesFiguresData> = getTablesAndFigures(
    attachmentTablesAndFigures,
    req,
    phrases
  )
  const attachmentTablesFiguresProps: AttachmentTablesFiguresProps = {
    accordions: attachmentTableAndFigureView.map(({ id, open, subHeader, body, contentType, props }) => {
      return {
        id,
        contentType,
        open,
        subHeader,
        body,
        props,
      }
    }),
    freeText: page.data.freeTextAttachmentTablesFigures
      ? processHtml({
          value: page.data.freeTextAttachmentTablesFigures.replace(/&nbsp;/g, ' '),
        })
      : undefined,
    showAll: phrases.showAll,
    showLess: phrases.showLess,
    appName: app.name,
    title,
  }

  const accordionComponent = r4XpRender('AttachmentTablesFigures', attachmentTablesFiguresProps, req, {
    id: 'accordion',
    body: `<section class="xp-part attachment-tables-figures"></section>`,
  })

  const accordionBody: string | null = accordionComponent.body
  const accordionPageContributions: XP.PageContributions = accordionComponent.pageContributions
  const pageContributions: XP.PageContributions | null = getFinalPageContributions(
    accordionPageContributions,
    attachmentTableAndFigureView
  )

  if (!attachmentTablesAndFigures.length && !(req.mode === 'edit' && page.type !== `${app.name}:statistics`)) {
    return {
      body: null,
    }
  } else {
    return {
      body: accordionBody,
      pageContributions,
      contentType: 'text/html',
    }
  }
}
