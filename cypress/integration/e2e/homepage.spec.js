describe("Request https://www.test.ssb.no/", () => {
    beforeEach(() => {})

    it('Check if site is up', () => {
        cy.request('https://www.test.ssb.no/')        
    })
})