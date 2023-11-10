import { type TableView, getTableViewData } from '/lib/ssb/parts/table'
import { type TbprocessorParsedResponse, getTbmlData } from '/lib/ssb/dataset/tbprocessor/tbml'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { render } from '/lib/thymeleaf'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

const view = resolve('./tbmlPreview.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const tbml = req.params.tbml
  const language: string = req.params.lang ? req.params.lang : 'no'
  const baseUrl: string = app.config?.['ssb.tbprocessor.baseUrl']
    ? (app.config['ssb.tbprocessor.baseUrl'] as string)
    : 'https://i.ssb.no/tbprocessor'
  const tbProceessorUrl = `${baseUrl}/process/tbmldata/${tbml}?lang=${language}`
  const tbmlData: TbprocessorParsedResponse<TbmlDataUniform> | null = tbml
    ? (getTbmlData(tbProceessorUrl) as TbprocessorParsedResponse<TbmlDataUniform>)
    : null

  if (tbmlData?.parsedBody) {
    const table: TableView = getTableViewData(tbmlData.parsedBody)
    const props: TableProps = {
      displayName: `Forhåndsvisning TBML ${tbml}`,
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

    const id = 'tbml-previewId'
    const body: string = render(view, {
      tbmlPreviewId: id,
      title: `Forhåndsvisning av TBML ID: ${tbml}`,
      language: `Språkversjon: ${language}`,
    })

    return r4xpRender('Table', props, req, {
      id,
      body: body,
    })
  } else {
    return {
      body: null,
    }
  }
}

interface TableProps {
  displayName: string
  table: object
}
