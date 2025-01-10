import { type Content } from '/lib/xp/content'
import { getContent, getComponent, getSiteConfig } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { get as getKeyFigures, parseKeyFigure } from '/lib/ssb/parts/keyFigure'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'

import * as util from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { DATASET_BRANCH, UNPUBLISHED_DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { getPhrases } from '/lib/ssb/utils/language'
import { type KeyFigureView, type KeyFigureData, type KeyFigureProps } from '/lib/types/partTypes/keyFigure'
import { type MunicipalityWithCounty, type RequestWithCode } from '/lib/types/municipalities'
import { type KeyFigure as KeyFigurePartConfig } from '.'

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<XP.PartComponent.KeyFigure>()?.config
    if (!config) throw Error('No part found')

    const keyFigureIds: Array<string> | [] = config.figure ? util.data.forceArray(config.figure) : []
    const municipality: MunicipalityWithCounty | undefined = getMunicipality(req as RequestWithCode)
    return renderPart(req, municipality, keyFigureIds, false)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function macroPreview(req: XP.Request, id: string): XP.Response {
  try {
    const municipality = getSiteConfigAndMunicipality()
    return renderPart(req, municipality, [id], true)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string): XP.Response {
  try {
    const municipality = getSiteConfigAndMunicipality()
    return renderPart(req, municipality, [id], false)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function getSiteConfigAndMunicipality() {
  const siteConfig = getSiteConfig<XP.SiteConfig>()
  if (!siteConfig) throw Error('No site config found')

  const defaultMunicipality: XP.SiteConfig['defaultMunicipality'] = siteConfig.defaultMunicipality
  const municipality: MunicipalityWithCounty | undefined = getMunicipality({
    code: defaultMunicipality,
  } as RequestWithCode)
  return municipality
}

function renderPart(
  req: XP.Request,
  municipality: MunicipalityWithCounty | undefined,
  keyFigureIds: Array<string>,
  isMacro: boolean
): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const config = getComponent<XP.PartComponent.KeyFigure>()?.config

  const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, page._id)

  // get all keyFigures and filter out non-existing keyFigures
  const keyFigures: Array<KeyFigureData> = getKeyFigures(keyFigureIds).map((keyFigure) => {
    const keyFigureData: KeyFigureView = parseKeyFigure(keyFigure, municipality, DATASET_BRANCH)
    return {
      id: keyFigure._id,
      ...keyFigureData,
      source: keyFigure.data.source,
    }
  }) as Array<KeyFigureData>

  let keyFiguresDraft: Array<KeyFigureData> | null = null
  if (showPreviewDraft) {
    keyFiguresDraft = getKeyFigures(keyFigureIds).map((keyFigure) => {
      const keyFigureData: KeyFigureView = parseKeyFigure(keyFigure, municipality, UNPUBLISHED_DATASET_BRANCH)
      return {
        id: keyFigure._id,
        ...keyFigureData,
        source: keyFigure.data.source,
      }
    }) as Array<KeyFigureData>
  }

  return renderKeyFigure(page, keyFigures, keyFiguresDraft, showPreviewDraft, req, isMacro, config)
}

function renderKeyFigure(
  page: Content,
  parsedKeyFigures: Array<KeyFigureData>,
  parsedKeyFiguresDraft: Array<KeyFigureData> | null,
  showPreviewDraft: boolean,
  req: XP.Request,
  isMacro: boolean,
  config?: KeyFigurePartConfig
): XP.Response {
  const draftExist = !!parsedKeyFiguresDraft
  const rawDateInput = page.data.dateInput as string | undefined
  const dateInput = rawDateInput ? rawDateInput : undefined

  const existingTimeValue = parsedKeyFigures.find((keyFigure) => keyFigure.time)?.time

  const timeValue = existingTimeValue || dateInput || undefined

  if ((parsedKeyFigures && parsedKeyFigures.length > 0) || draftExist) {
    const hiddenTitle: Array<string> = parsedKeyFigures.map((keyFigureData) => {
      return keyFigureData.title
    })

    const props: KeyFigureProps = {
      displayName: config?.title,
      keyFigures: parsedKeyFigures.map((keyFigureData) => ({
        ...keyFigureData,
        time: timeValue,
        glossary: keyFigureData.glossaryText,
      })),
      keyFiguresDraft: parsedKeyFiguresDraft
        ? parsedKeyFiguresDraft.map((keyFigureDraftData) => ({
            ...keyFigureDraftData,
            time: timeValue,
            glossary: keyFigureDraftData.glossaryText,
          }))
        : undefined,
      sourceLabel: getPhrases(page)!.source,
      source: config?.source,
      columns: !!config?.columns,
      showPreviewDraft,
      paramShowDraft: req.params.showDraft,
      draftExist,
      pageTypeKeyFigure: page.type === `${app.name}:keyFigure`,
      hiddenTitle: hiddenTitle.toString().replace(/[\[\]']+/g, ''),
      isInStatisticsPage: page.type === `${app.name}:statistics`,
      isMacro,
    }

    return render('KeyFigure', props, req, {
      body: '<section class="xp-part key-figures container"></section>',
    })
  }

  return {
    body: '',
    contentType: 'text/html',
  }
}
