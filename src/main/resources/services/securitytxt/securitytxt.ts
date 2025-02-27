export const get = () => {
  const body = `Contact: mailto:sikkerhetssenter@ssb.no
Preferred-Languages: nb,en
Hiring: https://www.ssb.no/omssb/jobb-i-ssb`
  return {
    contentType: 'text/plain',
    body,
  }
}
