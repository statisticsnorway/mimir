
import { ByteSource } from '/lib/xp/content'
import { HttpResponse } from '/lib/http-client' 

__non_webpack_require__('/lib/ssb/polyfills/nashorn')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

export function getTbmlMock(url: string): HttpResponse | null {
  if (app.config && app.config['ssb.mock.enable'] === 'true') {
    if (url.includes('process/tbmldata/-1')) {
      return getTbmlMock1()
    } else if (url.includes('document/sourceList/-1')) {
      return getSourceListMock1()
    }

    if (url.includes('process/tbmldata/-2')) {
      return getTbmlMock2()
    } else if (url.includes('document/sourceList/-2')) {
      return getSourceListMock2()
    }

    if (url.includes('process/tbmldata/-3')) {
      return getTbmlMock3()
    } else if (url.includes('document/sourceList/-3')) {
      return getSourceListMock3()
    }
  }
  return null
}

function getTbmlMock1(): HttpResponse {
  return {
    status: 200,
    message: '',
    body: `<?xml version="1.0" encoding="utf-8"?>
    <tbml>
        <metadata>
            <instance definitionId="-1" xml:lang="no" relatedTableIds="-1" publicRelatedTableIds="-1"/>
            <title>Dagens Dato</title>
            <tablesource>Statistisk sentralbyrå</tablesource>
            <category>FACTSPAGEFIGURES</category>
            <tags></tags>
        </metadata>
        <presentation>
            <table class="statistics">
                <thead>
                    <tr>
                        <th>Dagens Dato</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${moment().format('LL')}</td>
                    </tr>
                </tbody>
            </table>
        </presentation>
    </tbml>`,
    contentType: 'text/xml; charset=utf-8',
    headers: {},
    bodyStream: {} as unknown as ByteSource
  }
}

function getSourceListMock1(): HttpResponse {
  return {
    status: 200,
    message: '',
    body: `<?xml version="1.0" encoding="utf-8"?>
    <sourceList>
      <tbml id="-1">
        <source id="ID2001882" owner="241" table="dagensdato" tableId="-1" tableApproved="internet"/>
      </tbml>
    </sourceList>`,
    contentType: 'text/xml; charset=utf-8',
    headers: {},
    bodyStream: {} as unknown as ByteSource
  }
}

function getTbmlMock2(): HttpResponse {
  return {
    status: 200,
    message: '',
    body: `<?xml version="1.0" encoding="utf-8"?>
    <tbml>
      <metadata>
        <instance definitionId="-2" xml:lang="no" relatedTableIds="-2" publicRelatedTableIds="-2"/>
        <title noterefs="local:dictionary:note0">
          Barn og unge med tiltak i løpet av året og per 31. desember etter innvandringskategori, landbakgrunn, hjelpe- og omsorgstiltak og kjønn
        </title>
        <tablesource>Statistisk sentralbyrå</tablesource>
        <shortnameweb>barneverng</shortnameweb>
        <tags>Tabell6-11298</tags>
        <notes>
          <note noteid="local:dictionary:note0">Tall fra og med 2018 er foreløpige</note>
          <note noteid="local:dictionary:note1">Bruttonasjonalprodukt er målt i markedsverdi, mens bruttoprodukt i næringer er målt i basisverdi.</note>
          <note noteid="local:dictionary:note2">Omfatter utvinning av råolje og naturgass, rørtransport og utenriks sjøfart.</note>
        </notes>
      </metadata>
      <presentation>
        <table class="statistics">
          <thead>
            <tr>
              <th>2019</th>
              <th>Barn med barnevernstiltak i løpet av året</th>
              <th>Barn med barnevernstiltak i løpet av året</th>
              <th>Barn med barnevernstiltak i løpet av året</th>
              <th>Barn med barnevernstiltak i løpet av året</th>
              <th>Barn med barnevernstiltak i løpet av året</th>
              <th>Barn med barnevernstiltak per 31.12</th>
              <th>Barn med barnevernstiltak per 31.12</th>
              <th>Barn med barnevernstiltak per 31.12</th>
              <th>Barn med barnevernstiltak per 31.12</th>
            </tr>
            <tr>
              <th>Alder i alt</th>
              <th>Type tiltak</th>
              <th>Kjønn i alt</th>
              <th>Gutar</th>
              <th>Jenter</th>
              <th>Uoppgitt kjønn</th>
              <th>Kjønn i alt</th>
              <th>Gutar</th>
              <th>Jenter</th>
              <th>Uoppgitt kjønn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td/>
              <th class="title">Barn og unge i alt</th>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
            </tr>
            <tr>
              <th>I alt</th>
              <th>Tiltak i alt</th>
              <td>54592</td>
              <td>30149</td>
              <td>24443</td>
              <td>0</td>
              <td>37866</td>
              <td>21037</td>
              <td>16829</td>
              <td>0</td>
            </tr>
            <tr>
              <th class="level1">EU28/EØS, Sveits, USA, Canada, Australia og New Zealand</th>
              <th>Tiltak i alt</th>
              <td>2146</td>
              <td>1162</td>
              <td>984</td>
              <td>0</td>
              <td>1343</td>
              <td>731</td>
              <td>612</td>
              <td>0</td>
            </tr>
            <tr>
              <th class="title">Innvandrarar</th>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
              <td/>
            </tr>
            <tr>
              <th class="level1">Level 1</th>
              <th>Tiltak i alt</th>
              <td>2146</td>
              <td>1162</td>
              <td>984</td>
              <td>0</td>
              <td>1343</td>
              <td>731</td>
              <td>612</td>
              <td>0</td>
            </tr>
            <tr>
              <th class="level2">Level 2</th>
              <th></th>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <th class="level3">Level 3</th>
              <th>Tiltak i alt</th>
              <td>2146</td>
              <td>1162</td>
              <td>984</td>
              <td>0</td>
              <td>1343</td>
              <td>731</td>
              <td>612</td>
              <td>0</td>
            </tr>
            <tr>
              <th>¬ Konsum i husholdninger</th>
              <th>0</th>
              <td>1</td>
              <td>20</td>
              <td>300</td>
              <td>4000</td>
              <td>50000</td>
              <td>600000</td>
              <td>7000000</td>
              <td>80000000</td>
            </tr>
            <tr>
              <th>¬¬ Varekonsum</th>
              <th>0</th>
              <td>1</td>
              <td>20</td>
              <td>300</td>
              <td>4000</td>
              <td>50000</td>
              <td>600000</td>
              <td>7000000</td>
              <td>80000000</td>
            </tr>
            <tr>
              <th>¬¬¬ Konsum i statsforvaltningen, sivilt</th>
              <th>0</th>
              <td>-1</td>
              <td>-20</td>
              <td>-300</td>
              <td>-4000</td>
              <td>-50000</td>
              <td>-600000</td>
              <td>-7000000</td>
              <td>-80000000</td>
            </tr>
            <tr>
              <th class="sum">Test</th>
              <td>.</td>
              <td>..</td>
              <td>:</td>
              <td>…</td>
              <td>-</td>
              <td class="preliminary">1000.3</td>
              <td class="preliminary">-3040.36</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </presentation>
    </tbml>`,
    contentType: 'text/xml; charset=utf-8',
    headers: {},
    bodyStream: {} as unknown as ByteSource
  }
}

function getSourceListMock2(): HttpResponse {
  return {
    status: 200,
    message: '',
    body: `<?xml version="1.0" encoding="utf-8"?>
    <sourceList>
      <tbml id="-2">
        <source id="ID2001882" owner="241" table="mimir2" tableId="-2" tableApproved="internet"/>
      </tbml>
    </sourceList>`,
    contentType: 'text/xml; charset=utf-8',
    headers: {},
    bodyStream: {} as unknown as ByteSource
  }
}


function getTbmlMock3(): HttpResponse {
  return {
    status: 200,
    message: '',
    body: `<?xml version="1.0" encoding="utf-8"?>
    <tbml>
      <metadata>
        <instance definitionId="-3" xml:lang="no" relatedTableIds="-3 -3000 -30000" publicRelatedTableIds="-3 -3000 -30000"/>
        <title noterefs="local:dictionary:note6 local:dictionary:note8 local:dictionary:note7">Omsetning. Prosentvis endring og millioner kroner</title>
        <tablesource>Statistisk sentralbyrå</tablesource>
        <notes>
          <note noteid="local:dictionary:note0">
            Korrigert for at ukedager har ulik arbeidsintensitet og for offentlige fri- og helligdager i Norge.
          </note>
          <note noteid="local:dictionary:note333">
            Denne fotnotes skal ikke vises frem i den endelige teksten. Jabberwocky.
          </note>
          <note noteid="local:dictionary:note6">
            Vektgrunnlaget er tilverkingssverdi til faktorpris.</note>
          <note noteid="local:dictionary:note7">
            Korrigert for at vekedagar har ulik arbeidsintensitet og for offentlege fri- og heilagdagar i Noreg. Ramenfredag.
          </note>
          <note noteid="local:dictionary:note8">
            Nivå for aggregering er knytt til standard for næringsgruppering (SN2007). Sjå NOS D383 for nærare om dette.
          </note>
        </notes>
        <shortnameweb>ogibkoms</shortnameweb>
        <tags>Hovedtabell</tags>
      </metadata>
      <presentation>
        <table class="statistics">
          <thead>
            <tr>
              <td rowspan="3"/>
              <th colspan="2">Sesongjustert</th>
              <th noterefs="local:dictionary:note0">Kalenderjustert</th>
              <th>Ujustert</th>
            </tr>
            <tr>
              <th>Månedsendring</th>
              <th>3-månedsendring</th>
              <th>12-månedsendring</th>
              <th>Mill. kr</th>
            </tr>
            <tr>
              <th>Februar 2021 / Januar 2021</th>
              <th>Desember 2020 - Februar 2021 / September 2020 - November 2020</th>
              <th>Februar 2021 / Februar 2020</th>
              <th>Februar 2021</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th class="sum" noterefs="local:dictionary:note0">Utvinning, bergverk, industri og kraft</th>
              <td class="sum">9.0</td>
              <td class="sum">14.8</td>
              <td class="sum">18.9</td>
              <td class="sum">151215</td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th>II. Faktiske kortsiktige netto valutastraumer (nominell verdi)</th>
              <th colspan="4">Februar 2021</th>
            </tr>
            <tr>
              <th>Løpetid</th>
              <th class="sum">Løpetid total</th>
              <th class="sum">Løpetid 0-1 mnd</th>
              <th class="sum">Løpetid 1-3 mnd</th>
              <th class="sum">Løpetid 3-12 mnd</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1. Lån, verdipapir og innskot i utanlandsk valuta</th>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </presentation>
    </tbml>`,
    contentType: 'text/xml; charset=utf-8',
    headers: {},
    bodyStream: {} as unknown as ByteSource
  }
}

function getSourceListMock3(): HttpResponse {
  return {
    status: 200,
    message: '',
    body: `<?xml version="1.0" encoding="utf-8"?>
    <sourceList>
      <tbml id="-3">
        <source id="ID2001882" owner="241" table="mimir3" tableId="-3" tableApproved="internet"/>
        <source id="ID2001883" owner="241" table="mimir3000" tableId="-3000" tableApproved="internet"/>
        <source id="ID2001884" owner="241" table="mimir3000" tableId="-3000" tableApproved="internet"/>
        <source id="ID2001885" owner="241" table="mimir30000" tableId="-30000" tableApproved="internet"/>
      </tbml>
    </sourceList>`,
    contentType: 'text/xml; charset=utf-8',
    headers: {},
    bodyStream: {} as unknown as ByteSource
  }
}

export interface TbmlMockLib {
    getTbmlMock: (url: string) => HttpResponse | null;
}
