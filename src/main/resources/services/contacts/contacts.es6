require('../../lib/polyfills/nashorn');
import { getContactsFromRepo } from '../../lib/repo/statreg/contacts';

const contentType = 'application/json'

const NO_CONTACTS_FOUND = {
  id: '404',
  displayName: 'No Contacts Found'
}

const toSelectOptions = (contacts) =>
  contacts && Array.isArray(contacts) ?
    contacts.map(({ id, name, email, mobile, telephone }) => ({
      id,
      displayName: name,
      description: email,
      name,
      email,
      mobile,
      telephone
    })) :
    [NO_CONTACTS_FOUND]

exports.get = (req) => {
  const allOptions = toSelectOptions(getContactsFromRepo())

  const options = req.params.query ?
    allOptions.filter((opt) =>
      opt.displayName.toLowerCase().includes(req.params.query.toLowerCase())) :
    allOptions

  log.info(`Results filtered on '${req.params.query}': ${JSON.stringify(options)} `)

  if (!options) {
    return {
      contentType,
      body: {
        hits: [NO_CONTACTS_FOUND],
        count: 1,
        total: 1
      },
      status: 404
    }
  }

  return {
    contentType,
    body: {
      hits: options,
      count: options.length,
      total: options.length
    },
    status: 200
  }
}
