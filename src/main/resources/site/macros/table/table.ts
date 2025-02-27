import { renderError } from '/lib/ssb/error/error'
import { preview } from '/site/parts/table/table'
import { type Table } from '.'

export function macro(context: XP.MacroContext<Table>) {
  try {
    const table = preview(context.request, context.params.table)

    if (table.status && table.status !== 200) throw new Error(`table with id ${context.params.table} missing`)

    return table
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
