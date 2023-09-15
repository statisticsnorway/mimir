const { getStatisticCalendarRss } = __non_webpack_require__('/lib/ssb/rss/statkal')

exports.get = function (req: XP.Request): XP.Response {
  return {
    body: getStatisticCalendarRss(req),
    contentType: 'text/html',
    status: 200,
  }
}
