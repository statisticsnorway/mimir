import { type Content } from '/lib/xp/content'
import { getContent, getComponent, assetUrl } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { type Contact as StatRegContacts } from '/lib/ssb/dashboard/statreg/types'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'
import { getSelectedContacts } from '/lib/ssb/parts/contact'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { getPhrases } from '/lib/ssb/utils/language'
import { type StatisticContactProps } from '/lib/types/partTypes/statisticContact'
import { type Statistics } from '/site/content-types'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')

  const pageLanguage: string = page.language ?? 'nb'
  const part = getComponent<XP.PartComponent.StatisticContact>()
  if (!part) throw Error('No part found')

  const phrases: Phrases = getPhrases(page) as Phrases

  const statRegContacts: Array<StatRegContacts> = getContactsFromRepo()
  let contactIds: Array<string> = []

  if (page.data.contacts) {
    contactIds = contactIds.concat(ensureArray(page.data.contacts))
  }

  const selectedContacts = getSelectedContacts(contactIds, statRegContacts, pageLanguage)

  const props: StatisticContactProps = {
    icon: assetUrl({
      path: 'SSB_ikon_statisticContacts.svg',
    }),
    label: phrases.contact,
    contacts: ensureArray(selectedContacts),
  }

  return render('site/parts/statisticContact/statisticContact', props, req, {
    id: 'contacts',
    body: `<section class="xp-part statistic-contacts"></section>`,
  })
}
