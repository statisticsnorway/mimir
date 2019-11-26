const numeral = require('/lib/numeral')

exports.createHumanReadableFormat = (value) => {
    return value > 999 ? numeral(value).format('0,0').replace(/,/, '&thinsp;') : value.toString().replace(/\./, ',')
}
