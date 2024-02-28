import { filterReleasesIntoArrays } from './filterReleasesUtils'

describe('filterReleasesIntoArrays ', () => {
  let count = 10
  let serverOffsetInMs = 0
  test('filters content releases correctly for same day before 8 AM', () => {
    const now = new Date('2023-11-08T07:55:00.000Z')
    const expectedContentOutput = {
      contentReleasesNextXDays: contentReleasesTestingData.slice(1, 3),
      contentReleasesAfterXDays: contentReleasesTestingData.slice(3),
    }
    expect(filterReleasesIntoArrays(contentReleasesTestingData, count, serverOffsetInMs, now)).toEqual(
      expectedContentOutput
    )
  })
  test('filters content releases correctly for same day after 8 AM', () => {
    const now = new Date('2023-11-08T08:05:00.000Z')
    const expectedContentOutput = {
      contentReleasesNextXDays: contentReleasesTestingData.slice(2, 3),
      contentReleasesAfterXDays: contentReleasesTestingData.slice(3),
    }
    expect(filterReleasesIntoArrays(contentReleasesTestingData, count, serverOffsetInMs, now)).toEqual(
      expectedContentOutput
    )
  })

  test('filters content releases correctly for day before first release and next 2 years', () => {
    const count = 2 * 365
    const now = new Date('2023-11-01T08:05:00.000Z')
    const expectedContentOutput = {
      contentReleasesNextXDays: contentReleasesTestingData,
      contentReleasesAfterXDays: [],
    }
    expect(filterReleasesIntoArrays(contentReleasesTestingData, count, serverOffsetInMs, now)).toEqual(
      expectedContentOutput
    )
  })

  test('filters content releases correctly for same day before 8 AM using locale time', () => {
    serverOffsetInMs = 60 * 60 * 1000
    const now = new Date('08 Nov 2023 07:55:00 GMT+1')
    const expectedContentOutput = {
      contentReleasesNextXDays: contentReleasesTestingData.slice(1, 3),
      contentReleasesAfterXDays: contentReleasesTestingData.slice(3),
    }
    expect(filterReleasesIntoArrays(contentReleasesTestingData, count, serverOffsetInMs, now)).toEqual(
      expectedContentOutput
    )
  })
})

const contentReleaseExample = {
  id: '123',
  name: 'name',
  type: 'Rapport',
  date: '2023-11-07T00:00:00.000Z',
  mainSubject: 'Befolkning',
  day: '7',
  month: '11',
  monthName: 'nov.',
  year: '2023',
  upcomingReleaseLink: '',
}

const contentReleasesTestingData = [
  {
    ...contentReleaseExample,
    id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
    name: 'Bank og finans test 1',
    date: '2023-11-07T00:00:00.000Z',
    day: '7',
  },
  {
    ...contentReleaseExample,
    id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
    name: 'Test 2',
    date: '2023-11-08T00:00:00.000Z',
    day: '8',
  },
  {
    ...contentReleaseExample,
    id: '03333333-6eb3-4fb1-9ce7-871ae40349f7',
    name: 'Test 3',
    date: '2023-11-09T00:00:00.000Z',
    day: '9',
  },
  {
    ...contentReleaseExample,
    id: '03333333-6eb3-4fb1-9ce7-871ae40349f6',
    name: 'Test 4',
    date: '2024-11-28T00:00:00.000Z',
    day: '28',
    year: '2024',
  },
]
