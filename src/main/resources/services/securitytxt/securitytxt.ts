exports.get = () => {
  const body = `Contact: mailto:sikkerhetssenter@ssb.no
Expires: 2023-11-31T06:00:00.000Z
Preferred-Languages: nb,en
Hiring: https://www.ssb.no/omssb/jobb-i-ssb`
  return {
    contentType: 'text/plain',
    body,
  }
}
