import { flattenReleases, flattenContentReleases, mergeAndSortReleases } from './upcomingReleases.tsx'

describe('Upcoming Releases', () => {
  test('flattens content release data correctly', () => {
    const expectedContentOutput = [
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
      {
        date: '2023-11-28',
        releases: [
          {
            id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
            mainSubject: 'Befolkning',
            name: 'Test 2',
            type: 'Rapport',
            url: '',
          },
          {
            id: '03333333-6eb3-4fb1-9ce7-871ae40349f8',
            mainSubject: 'Befolkning',
            name: 'Test 3',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ]
    expect(flattenContentReleases(contentReleasesTestingData)).toEqual(expectedContentOutput)
  })

  test('flattens release data correctly', () => {
    const expectedOutput = [
      {
        date: '2023-11-27',
        releases: [
          {
            id: 5174,
            name: 'Varehandelindeksen',
            type: 'statistikk',
            mainSubject: 'Varehandel',
            url: '/varehandel-og-tjenesteyting/varehandel/statistikk/varehandelsindeksen',
            variant: {
              day: 27,
              frequency: 'Måned',
              id: 8147,
              monthNumber: 10,
              period: 'Tall for oktober 2023',
              year: 2023,
            },
          },
          {
            id: 5900,
            name: 'Lufttransport',
            type: 'statistikk',
            mainSubject: 'Luftfart',
            url: '/transport-og-reiseliv/luftfart/statistikk/lufttransport',
            variant: {
              day: 27,
              frequency: 'Måned',
              id: 174023,
              monthNumber: 10,
              period: 'Tall for oktober 2023',
              year: 2023,
            },
          },
        ],
      },
      {
        date: '2023-11-28',
        releases: [
          {
            id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
            name: 'Test 2',
            type: 'Rapport',
            mainSubject: 'Befolkning',
            url: '',
          },
        ],
      },
    ]
    expect(flattenReleases(releaseTestingData)).toEqual(expectedOutput)
  })

  test('merges two arrays with non-overlapping dates', () => {
    const array1 = [
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ]

    const array2 = [
      {
        date: '2023-11-28',
        releases: [
          {
            id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
            mainSubject: 'Befolkning',
            name: 'Test 2',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ]

    const expected = [
      {
        date: '2023-11-28',
        releases: [
          {
            id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
            mainSubject: 'Befolkning',
            name: 'Test 2',
            type: 'Rapport',
            url: '',
          },
        ],
      },
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ]

    expect(mergeAndSortReleases(array2, array1)).toEqual(expected)
  })

  test('merges two arrays with same content / duplicates', () => {
    const array1 = [
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ]

    expect(mergeAndSortReleases(array1, array1)).toEqual(array1)
  })

  test('merge two empty arrays', () => {
    expect(mergeAndSortReleases([], [])).toEqual([])
  })

  test('merge two arrays with content from same date', () => {
    const array1 = [
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
      {
        date: '2024-11-18',
        releases: [
          {
            id: '8aaaaaa-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 3',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ]
    expect(mergeAndSortReleases(array1, [])).toEqual([
      {
        date: '2024-11-08',
        releases: [
          {
            id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 1',
            type: 'Rapport',
            url: '',
          },
        ],
      },
      {
        date: '2024-11-18',
        releases: [
          {
            id: '8aaaaaa-b6c7-4fa6-9dd5-342bf3908e85',
            mainSubject: 'Bank og finansmarked',
            name: 'Bank og finans test 3',
            type: 'Rapport',
            url: '',
          },
        ],
      },
    ])
  })
})

const releaseTestingData = [
  {
    year: '2023',
    releases: [
      {
        month: '10',
        monthName: 'nov.',
        releases: [
          {
            day: '27',
            releases: [
              {
                id: 5174,
                name: 'Varehandelindeksen',
                shortName: 'doi',
                type: 'statistikk',
                mainSubject: 'Varehandel',
                variant: {
                  id: 8147,
                  day: 27,
                  monthNumber: 10,
                  year: 2023,
                  frequency: 'Måned',
                  period: 'Tall for oktober 2023',
                },
                statisticsPageUrl: '/varehandel-og-tjenesteyting/varehandel/statistikk/varehandelsindeksen',
                aboutTheStatisticsDescription:
                  'Varehandelsindeksen beskriver verdi- og volumutvikling i varehandelen, som utgjør næringshovedområde G i Standard for næringsgruppering (SN2007). Det består av handel med og reparasjon av motorvogner, agentur- og engroshandel, unntatt med motorvogner og detaljhandel, unntatt med motorvogner. Engroshandel er virksomheter som driver salg av varer til andre bedrifter, mens detaljhandel er virksomheter som driver salg av varer til private husholdninger. Tidligere publiserte sesongjusterte tall kan bli revidert når det legges inn tall for en ny måned i serien.',
              },
              {
                id: 5900,
                name: 'Lufttransport',
                shortName: 'flytrafikk',
                type: 'statistikk',
                mainSubject: 'Luftfart',
                variant: {
                  id: 174023,
                  day: 27,
                  monthNumber: 10,
                  year: 2023,
                  frequency: 'Måned',
                  period: 'Tall for oktober 2023',
                },
                statisticsPageUrl: '/transport-og-reiseliv/luftfart/statistikk/lufttransport',
                aboutTheStatisticsDescription:
                  'Statistikken beskriver all kommersiell lufttransport av passasjerer og gods i Norge og mellom Norge og utlandet. Tallene omfatter blant annet flygninger og antall terminalpassasjerer mellom norske lufthavner.',
              },
            ],
          },
          {
            day: 28,
            releases: [
              {
                id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
                name: 'Test 2',
                type: 'Rapport',
                date: '2023-11-28T00:00:00.000Z',
                mainSubject: 'Befolkning',
                day: '28',
                month: '11',
                monthName: 'nov.',
                year: '2023',
                upcomingReleaseLink: '',
              },
            ],
          },
        ],
      },
    ],
  },
]

const contentReleasesTestingData = [
  {
    id: '8a32e273-b6c7-4fa6-9dd5-342bf3908e85',
    name: 'Bank og finans test 1',
    type: 'Rapport',
    date: '2024-11-08T00:00:00.000Z',
    mainSubject: 'Bank og finansmarked',
    day: '8',
    month: '11',
    monthName: 'nov.',
    year: '2024',
    upcomingReleaseLink: '',
  },
  {
    id: '0335f9fd-6eb3-4fb1-9ce7-871ae40349f8',
    name: 'Test 2',
    type: 'Rapport',
    date: '2023-11-28T00:00:00.000Z',
    mainSubject: 'Befolkning',
    day: '28',
    month: '11',
    monthName: 'nov.',
    year: '2023',
    upcomingReleaseLink: '',
  },
  {
    id: '03333333-6eb3-4fb1-9ce7-871ae40349f8',
    name: 'Test 3',
    type: 'Rapport',
    date: '2023-11-28T00:00:00.000Z',
    mainSubject: 'Befolkning',
    day: '28',
    month: '11',
    monthName: 'nov.',
    year: '2023',
    upcomingReleaseLink: '',
  },
]
