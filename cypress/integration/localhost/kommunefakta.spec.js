describe('Municipality fact page', () => {
  before(() => {
    cy.visit('/kommunefakta/oslo')
  })

  it('Get the current url', () => {
    cy.url().should('eq', 'http://localhost:8080/kommunefakta/oslo')
  })

  const getMunicipality = () => {
    return cy.request('/kommunefakta/_/service/mimir/municipality?postalCode=0301')
      .its('body')
  }

  it('Get municipality body', () => {
    getMunicipality()
      .should('deep.equal', {
        'municipality': {
          'code': '0301',
          'displayName': 'Oslo',
          'county': {
            'name': 'Oslo'
          },
          'path': '/oslo'
        }
      })
  })

  it('Request municipality page Oslo', () => {
    cy.request('/kommunefakta/_/service/mimir/municipality?postalCode=0301')
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('municipality')
        expect(response.body).to.not.be.null
      })
  })
  it('Seksjonstitler på kommunefakta', () => {
    cy.get('h2')
      .should('contain', 'Befolkning')
      .should('contain', 'Bolig')
      .should('contain', 'Arbeid og utdanning')
      .should('contain', 'Kultur')
      .should('contain', 'Helse')
      .should('contain', 'Kommunens økonomi')
  })

  it('Befolkning: Check source links', () => {
    cy.get('a[href*="08425"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/08425')
    cy.get('a[href*="folkemengde"]').should('have.attr', 'href', 'https://www.ssb.no/folkemengde')
    cy.get('a[href*="07459"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/07459')
    cy.get('a[href*="01222"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/01222')
    cy.get('a[href*="04231"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/04231')
    cy.get('a[href*="09588"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/09588')
    cy.get('a[href*="01222"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/01222')
    cy.get('a[href*="11668"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/11668')
  })

  it('Bolig: Check source links', () => {
    cy.get('a[href*="06265"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/06265/')
    cy.get('a[href*="05467"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/05467/')
    cy.get('a[href*="06520"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/06520/')
    cy.get('a[href*="09747"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/09747')
    cy.get('a[href*="01222"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/01222')
    cy.get('a[href*="11046"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/11046/')
  })

  it('Arbeid og utdanning: Check source links', () => {
    cy.get('a[href*="11761"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/11761')
    cy.get('a[href*="12025"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12025')
  })

  it('Kultur: Check source links', () => {
    cy.get('a[href*="12061"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12061')
    cy.get('a[href*="12060"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12060')
    cy.get('a[href*="kultur_kostra"]').should('have.attr', 'href', 'https://www.ssb.no/kultur_kostra')
  })

  it('Helse: Check source links', () => {
    cy.get('a[href*="12005"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12005')
    cy.get('a[href*="11996"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/11996')
    cy.get('a[href*="12003"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12003')
    cy.get('a[href*="12292"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12292')
    cy.get('a[href*="11875"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/11875')
    cy.get('a[href*="12209"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12209')
  })

  it('Kommunens Økonomi: Check source links', () => {
    cy.get('a[href*="12134"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12134')
    cy.get('a[href*="12137"]').should('have.attr', 'href', 'https://www.ssb.no/statbank/table/12137')
  })
})
