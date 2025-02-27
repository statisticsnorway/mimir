import '/lib/ssb/polyfills/nashorn'
import { handleRepoGet } from '/lib/ssb/dashboard/statreg/repoUtils'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'

const toOption = ({ id, name, email, mobile, telephone }) => ({
  id,
  displayName: name,
  description: email,
  name,
  email,
  mobile,
  telephone,
})

const filterByDisplayName = (contacts, filters) => {
  log.info(`searching ${filters.query} in ${contacts.length}`)
  return contacts.filter((c) =>
    filters.query != undefined ? c.name.toLowerCase().includes(filters.query.toLowerCase()) : 'a'
  )
}

const filterByIds = (contacts, filters) => {
  return (
    filters.ids &&
    filters.ids.split(',').reduce((acc, id) => {
      const found = contacts.find((c) => `${c.id}` === id)
      return found ? acc.concat(found) : acc.concat({ id: id, name: 'Slettet kontakt', email: '' })
    }, [])
  )
}

export function get(req: XP.Request): XP.Response {
  return handleRepoGet(
    req,
    'Contacts',
    getContactsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByDisplayName
  )
}
