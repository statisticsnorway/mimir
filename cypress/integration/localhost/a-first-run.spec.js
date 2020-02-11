context('A-warm-up localhost:8080/xp/kommunefakta', () => {
    beforeEach(() => {})

    it('Run first to see if municipality is working', () => {      
      cy.request('http://localhost:8080/xp/kommunefakta/', {
        failOnStatusCode: false,
        retryOnNetworkFailure: true,        
      })
    })
  })
  