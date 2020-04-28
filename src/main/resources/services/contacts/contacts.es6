const {
    getContacts
} = __non_webpack_require__('/lib/statreg/contacts');

const contentType = 'application/json';

exports.get = (req) => {
    const contacts = getContacts({ query: req.query.contact });
    return {
        contentType,
        body: {
            contacts
        },
        status: 200
    };
};