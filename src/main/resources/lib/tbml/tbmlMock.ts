
import { ByteSource } from 'enonic-types/content'
import { HttpResponse } from 'enonic-types/http'
import moment = require('moment')
__non_webpack_require__('/lib/polyfills/nashorn')

export function getTbmlMock(url: string): HttpResponse | null {
  if (app.config && app.config['ssb.mock.enable'] === 'true') {
    if (url.includes('process/tbmldata/-1')) {
      return getTbmlMock1()
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
            <instance definitionId="0" xml:lang="no" relatedTableIds="0" publicRelatedTableIds="0"/>
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
                        <td>${moment().format('D. MMMM YYYY')}</td>
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

export interface TbmlMockLib {
    getTbmlMock: (url: string) => HttpResponse | null;
}
