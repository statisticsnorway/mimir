import '/lib/ssb/polyfills/nashorn'
import { type Request, type Response } from '@enonic-types/core'
import { handleRepoGet } from '/lib/ssb/dashboard/statreg/repoUtils'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'
import { type Contact as StatRegContact } from '/lib/ssb/dashboard/statreg/types'

const toOption = ({ id, name, email, mobile, telephone }: StatRegContact) => ({
  id,
  displayName: name,
  description: email,
  name,
  email,
  mobile,
  telephone,
})

const filterByDisplayName = (contacts: StatRegContact[], filters: Request['params']) => {
  log.info(`searching ${filters.query} in ${contacts?.length}`)
  return (
    contacts?.filter((c) =>
      filters.query != undefined ? c.name.toLowerCase().includes((filters.query as string).toLowerCase()) : true
    ) || []
  )
}

const filterByIds = (contacts: StatRegContact[], filters: Request['params']) => {
  return (
    (filters?.ids as string | undefined)?.split(',').reduce((acc: StatRegContact[], id) => {
      const found = contacts.find((c) => `${c.id}` === id)
      return found
        ? acc.concat(found)
        : acc.concat({ id: id as unknown as number, name: 'Slettet kontakt', email: '' } as StatRegContact)
    }, []) || []
  )
}

export function get(req: Request): Response {
  return handleRepoGet(
    req,
    'Contacts',
    getContactsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByDisplayName
  )
}
