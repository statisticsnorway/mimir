describe('Request https://www.test.ssb.no/', () => {
  beforeEach(() => {})

  it('Check if site is up', () => {
    cy.request('https://www.test.ssb.no/')
  })
  it('Request municipality fact page', () => {
    cy.request('https://www.test.ssb.no/kommunefakta')
  })
  it('Request specific municipality', () => {
    cy.request('https://www.test.ssb.no/kommunefakta/ski')
  })

  // Add more tests here
})
