import { type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { type Contact as StatRegContacts } from '/lib/ssb/dashboard/statreg/types'
import { find } from '/lib/vendor/ramda'
import { render } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { getPhrases } from '/lib/ssb/utils/language'
import { type StatisticContactProps, type Contact } from '/lib/types/partTypes/statisticContact'
import { type Article, type Statistics } from '/site/content-types'

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

function splitPhoneNumber(number: string): string {
  return number?.match(/.{1,2}/g)?.join(' ') || ''
}

const landCodeVisual = '(+47) '
const landCode = '+47'

function transformContact(contact: StatRegContacts, language: string): Contact {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone:
      language == 'en' && contact.telephone != ''
        ? landCodeVisual.concat(splitPhoneNumber(contact.telephone as string))
        : splitPhoneNumber(contact.telephone as string),
    phoneLink: landCode.concat(contact.telephone as string),
  }
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Article | Statistics>>()
  if (!page) throw Error('No page found')

  const pageLanguage: string = page.language ? page.language : 'nb'
  const part = getComponent<XP.PartComponent.StatisticContact>()
  if (!part) throw Error('No part found')

  const phrases: Phrases = getPhrases(page) as Phrases

  const statRegContacts: Array<StatRegContacts> = getContactsFromRepo()
  let contactIds: Array<string> = []

  if (part.config.contacts) {
    contactIds = contactIds.concat(ensureArray(part.config.contacts))
  }
  if (page.data.contacts) {
    contactIds = contactIds.concat(ensureArray(page.data.contacts))
  }

  const selectedContacts = contactIds.reduce((acc: Array<Contact>, contactId) => {
    const found: StatRegContacts | undefined = statRegContacts
      ? find((contact: StatRegContacts) => `${contact.id}` === `${contactId}`)(statRegContacts)
      : undefined
    return found ? acc.concat(transformContact(found, pageLanguage)) : acc
  }, [])

  const props: StatisticContactProps = {
    label: phrases.contact,
    contacts: ensureArray(selectedContacts),
  }

  return render('site/parts/statisticContact/statisticContact', props, req, {
    id: 'contacts',
    body: `<section class="xp-part statistic-contacts"></section>`,
  })
}
