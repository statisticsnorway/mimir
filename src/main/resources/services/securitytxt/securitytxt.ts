exports.get = () => {
  const body = `Contact: mailto:sikkerhetssenter@ssb.no
Expires: 2023-11-31T06:00:00.000Z
Preferred-Languages: nb,en
Policy: We welcome any friendly bug report. Please contact us in advance if you wish to use methods that can trigger warnings or cause denial of service.
Acknowledgments: Acknowledgements will be given publically for any higher severity bug reports, or we can respect your privacy. Tell us what you wish when reporting to us.
Hiring: https://www.ssb.no/omssb/jobb-i-ssb`
  return {
    contentType: 'text/plain',
    body,
  }
}
