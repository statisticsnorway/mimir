__non_webpack_require__('/lib/ssb/polyfills/nashorn')
const { handleRepoGet } = __non_webpack_require__('/lib/ssb/dashboard/statreg/repoUtils')
const { getContactsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/contacts')

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
      return found ? acc.concat(found) : acc
    }, [])
  )
}

exports.get = (req) => {
  return handleRepoGet(
    req,
    'Contacts',
    getContactsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByDisplayName
  )
}
