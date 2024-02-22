context('A-warm-up localhost:8080/kommunefakta', () => {
  beforeEach(() => {})

  it('Run first to see if municipality is working', () => {
    cy.request('http://localhost:8080/kommunefakta', {
      failOnStatusCode: false,
      retryOnNetworkFailure: true
    })
  })
})
