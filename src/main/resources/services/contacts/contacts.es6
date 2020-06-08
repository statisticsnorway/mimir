require('../../lib/polyfills/nashorn');
import { getContactsFromRepo } from '../../lib/repo/statreg/contacts';
import { handleRepoGet } from '../repoUtils'

const toOption = ({ id, name, email, mobile, telephone }) => ({
  id,
  displayName: name,
  description: email,
  name,
  email,
  mobile,
  telephone
})

const filterByDisplayName = (contact, filters) =>
  contact.name.toLowerCase().includes(filters.query)

exports.get = (req) => {
  return handleRepoGet(
    req,
    'Contacts', getContactsFromRepo,
    toOption, filterByDisplayName)
}
