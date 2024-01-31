import { data } from '/lib/util'
import { preview } from '../../parts/accordion/accordion'
import { Accordion } from '.'

export function macro(context: XP.MacroContext<Accordion>) {
  const accordionIds = context.params.accordion ? data.forceArray(context.params.accordion) : []
  return preview(context.request, accordionIds)
}
