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
    []

exports.get = (req) => {
  try {
    const allContacts = getContactsFromRepo()
    if (!allContacts) {
      const error = `Contacts StatReg node does not seem to be configured correctly. Unable to retrieve contacts`
      return {
        body: { error },
        status: 500
      }
    }

    const allOptions = toSelectOptions(allContacts)

    const filtered = req.params.query ?
      allOptions.filter((opt) =>
        opt.displayName.toLowerCase()
          .includes(req.params.query.toLowerCase())) :
      allOptions

    log.info(`Results filtered on '${req.params.query}': ${filtered ? filtered.length : 0} `)

    return {
      contentType,
      body: {
        hits: filtered,
        count: filtered.length,
        total: filtered.length
      },
      status: 200
    }
  } catch (exc) {
    log.error(`Error while fetching contacts: ${JSON.stringify(exc)}`)
    return {
      contentType,
      body: exc,
      status: 500
    }
  }
}
