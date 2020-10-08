__non_webpack_require__('/lib/polyfills/nashorn')
const {
  handleRepoGet
} = __non_webpack_require__('/lib/ssb/statreg/repoUtils')
const {
  getContactsFromRepo
} = __non_webpack_require__('/lib/repo/statreg/contacts')

const toOption = ({
  id, name, email, mobile, telephone
}) => ({
  id,
  displayName: name,
  description: email,
  name,
  email,
  mobile,
  telephone
})

const filterByDisplayName = (contacts, filters) => {
  log.info(`searching ${filters.query} in ${contacts.length}`)
  return contacts.filter((c) => c.name.toLowerCase().includes(filters.query.toLowerCase()))
}

const filterByIds = (contacts, filters) => {
  return filters.ids && filters.ids.split(',')
    .reduce((acc, id) => {
      const found = contacts.find((c) => `${c.id}` === id)
      return found ? acc.concat(found) : acc
    }, [])
}

exports.get = (req) => {
  return handleRepoGet(
    req,
    'Contacts',
    getContactsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByDisplayName)
}
