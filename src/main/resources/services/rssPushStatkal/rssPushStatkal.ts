const { getStatisticCalendarRss } = __non_webpack_require__('/lib/ssb/rss/statkal')

exports.get = function (): XP.Response {
  return {
    body: getStatisticCalendarRss(),
    contentType: 'text/html',
    status: 200,
  }
}
