import { type TableView, getTableViewData } from '/lib/ssb/parts/table'
import { getTbmlData, type TbprocessorParsedResponse } from '/lib/ssb/dataset/tbprocessor/tbml'
import { type TbmlDataUniform, TbmlSourceListUniform } from '/lib/types/xmlParser'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

export function get(req: XP.Request): XP.Response {
  try {
    const paramTbmlId = req.params.tbmlId
    const language: string = req.params.lang ? req.params.lang : 'no'
    return renderPart(req, language, paramTbmlId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, language: string, tbmlId?: string): XP.Response {
  const baseUrl: string = app.config?.['ssb.tbprocessor.baseUrl']
    ? (app.config['ssb.tbprocessor.baseUrl'] as string)
    : 'https://i.ssb.no/tbprocessor'
  const tbProceessorUrl = `${baseUrl}/process/tbmldata/${tbmlId}?lang=${language}`
  const tbmlData: TbprocessorParsedResponse<TbmlDataUniform | TbmlSourceListUniform> = getTbmlData(tbProceessorUrl)
  const tableData: TbmlDataUniform | undefined = (tbmlData.parsedBody as TbmlDataUniform) || undefined

  if (!tableData) {
    return {
      body: null,
    }
  }

  const table: TableView = getTableViewData(undefined, tableData)
  //log.info('Tabelldata: ' + JSON.stringify(table, null, 4))

  const props: TableProps = {
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

  return r4xpRender('Table', props, req)
}

interface TableProps {
  displayName: string
  table: object
}
