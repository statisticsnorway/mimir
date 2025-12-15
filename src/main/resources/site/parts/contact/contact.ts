import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { type Phrases } from '/lib/types/language'
import { type Contact as StatRegContacts } from '/lib/ssb/dashboard/statreg/types'
import { renderError } from '/lib/ssb/error/error'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'
import { getSelectedContacts } from '/lib/ssb/parts/contact'
import { ensureArray, chunkArray } from '/lib/ssb/utils/arrayUtils'
import { getPhrases } from '/lib/ssb/utils/language'
import { type ContactModel, type Contact } from '/lib/types/partTypes/contact'
import { type Article, type Statistics } from '/site/content-types'

const view = resolve('./contact.html')

export function get(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request) {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const WIDTH = 4 // how many boxes in a row
  const page = getContent<Content<Article | Statistics>>()
  if (!page) throw Error('No page found')

  const pageLanguage: string = page.language ? page.language : 'nb'
  const part = getComponent<XP.PartComponent.Contact>()
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

  const selectedContacts = getSelectedContacts(contactIds, statRegContacts, pageLanguage)
  const contacts: Array<Array<Contact>> = chunkArray(selectedContacts, WIDTH)

  const contactTitle: string = phrases.contact
  if (!contacts || contacts.length < 1) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics` && page.type !== `${app.name}:article`) {
      return {
        body: render(view, {
          label: contactTitle,
        }),
      }
    } else {
      return {
        body: null,
      }
    }
  }

  const model: ContactModel = {
    contactTitle,
    contacts,
  }

  const body: string = render(view, model)

  return {
    body,
    contentType: 'text/html',
  }
}
