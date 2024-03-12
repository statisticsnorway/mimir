import { getTableViewData } from '/lib/ssb/parts/table'
import { getTbmlData, type TbprocessorParsedResponse } from '/lib/ssb/dataset/tbprocessor/tbml'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { render } from '/lib/thymeleaf'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { type TbmlPreviewProps } from '/lib/types/partTypes/tbmlPreview'
import { type TableView } from '/lib/types/partTypes/table'

const view = resolve('./tbmlPreview.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const tbmlId = req.params.tbmlid
  const language = req.params.sprak ?? 'no'
  const baseUrl: string = app.config?.['ssb.tbprocessor.baseUrl'] || 'https://i.ssb.no/tbprocessor'
  const tbProceessorUrl = `${baseUrl}/process/tbmldata/${tbmlId}?lang=${language}`
  const tbmlData: TbprocessorParsedResponse<TbmlDataUniform> | null = tbmlId
    ? (getTbmlData(tbProceessorUrl) as TbprocessorParsedResponse<TbmlDataUniform>)
    : null

  const id = 'tbml-previewId'
  const body: string = render(view, {
    tbmlPreviewId: id,
    title: `Forhåndsvisning av TBML ID: ${tbmlId}`,
    subTitle: `Språkversjon: ${language}`,
    errorMessage:
      tbmlData?.status !== 200
        ? `Henting av tabell med tbmlId ${tbmlId} feilet, statuskode: ${tbmlData?.status} `
        : null,
  })

  if (!tbmlData?.parsedBody) {
    return {
      body,
    }
  }

  const table: TableView = getTableViewData(tbmlData.parsedBody)
  const props: TbmlPreviewProps = {
    displayName: `Forhåndsvisning TBML ${tbmlId}`,
    table: {
      caption: table.caption,
      thead: table.thead,
      tbody: table.tbody,
      tfoot: table.tfoot,
      tableClass: table.tableClass,
      language: language === 'en' ? 'en' : 'no',
      noteRefs: table.noteRefs,
    },
  }

  return r4xpRender('Table', props, req, {
    id,
    body: body,
  })
}
