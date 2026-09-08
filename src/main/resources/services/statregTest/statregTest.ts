import { type Response } from '@enonic-types/core'
import { request, HttpResponse } from '/lib/http-client'

export function get(): Response {
  try {
    const response: HttpResponse = request({
      url: 'https://ext-i.test.ssb.no/statistikkregisteret/api/releases',
      method: 'GET',
    })

    return {
      status: response.status,
      contentType: 'application/json',
      body: response.body,
    }
  } catch (error) {
    log.error(`statregTest failed to fetch StatReg data: ${error}`)

    return {
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Failed to fetch data from StatReg',
      }),
    }
  }
}
