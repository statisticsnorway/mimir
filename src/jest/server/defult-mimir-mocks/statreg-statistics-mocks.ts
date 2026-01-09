import { mockStatregConn } from '../mockXP'

//TODO: get syntax correct and test
mockStatregConn.create({
  data: {},
  name: 'statistics',
  parentPath: '/',
  _childOrder: '_ts DESC',
})

mockStatregConn.get()

export const statistics_json = {
  content: [
    {
      id: 4379,
      shortName: 'adopsjon',
      name: 'Adopsjoner',
      nameEN: 'Adoptions',
      modifiedTime: '2020-04-16 11:14:19.121',
      variants: {
        frekvens: 'År',
        previousRelease: '2020-06-09 08:00:00.0',
        nextRelease: '',
      },
    },
    {
      id: 4156,
      shortName: 'kpi',
      name: 'Konsumprisindeksen',
      nameEN: 'Consumer price index',
      modifiedTime: '2019-09-11 13:29:59.129',
      variants: {
        frekvens: 'Måned',
        previousRelease: '2020-12-10 08:00:00.0',
        nextRelease: '2021-01-11 08:00:00.0',
      },
    },
    {
      id: 5985,
      shortName: 'kolltrans',
      name: 'Kollektivtransport ',
      nameEN: 'Public transport ',
      modifiedTime: '2020-01-29 09:57:16.894',
      variants: [
        {
          frekvens: 'Kvartal',
          previousRelease: '2020-12-17 08:00:00.0',
          nextRelease: '2021-03-24 08:00:00.0',
        },
        {
          frekvens: 'År',
          previousRelease: '2020-05-28 08:00:00.0',
          nextRelease: '2021-05-27 08:00:00.0',
        },
      ],
    },
  ],
  data: [
    {
      id: 4379,
      shortName: 'adopsjon',
      name: 'Adopsjoner',
      nameEN: 'Adoptions',
      modifiedTime: '2024-12-18 10:33:59.716',
      status: 'A',
      variants: {
        id: 7799,
        frekvens: 'År',
        previousRelease: '2025-09-23 08:00:00.0',
        previousFrom: '2024-01-01 00:00:00.0',
        previousTo: '2024-12-31 00:00:00.0',
        nextRelease: '',
        nextReleaseId: '',
      },
    },
    {
      id: 4156,
      shortName: 'kpi',
      name: 'Konsumprisindeksen',
      nameEN: 'Consumer price index',
      modifiedTime: '2024-01-15 10:48:29.78',
      status: 'A',
      variants: {
        id: 8870,
        frekvens: 'Måned',
        previousRelease: '2025-12-10 08:00:00.0',
        previousFrom: '2025-11-01 00:00:00.0',
        previousTo: '2025-11-30 00:00:00.0',
        nextRelease: '2026-01-09 08:00:00.0',
        nextReleaseId: 196586,
        upcomingReleases: [
          {
            id: 196586,
            publishTime: '2026-01-09 08:00:00.0',
            periodFrom: '2025-12-01 00:00:00.0',
            periodTo: '2025-12-31 00:00:00.0',
          },
          {
            id: 204108,
            publishTime: '2026-02-10 08:00:00.0',
            periodFrom: '2026-01-01 00:00:00.0',
            periodTo: '2026-01-31 00:00:00.0',
          },
          {
            id: 204112,
            publishTime: '2026-03-10 08:00:00.0',
            periodFrom: '2026-02-01 00:00:00.0',
            periodTo: '2026-02-28 00:00:00.0',
          },
          {
            id: 204114,
            publishTime: '2026-04-10 08:00:00.0',
            periodFrom: '2026-03-01 00:00:00.0',
            periodTo: '2026-03-31 00:00:00.0',
          },
        ],
      },
    },
    {
      id: 5985,
      shortName: 'kolltrans',
      name: 'Kollektivtransport ',
      nameEN: 'Public transport ',
      modifiedTime: '2023-10-17 10:02:16.007',
      status: 'A',
      variants: [
        {
          id: 8798,
          frekvens: 'Kvartal',
          previousRelease: '2025-12-16 08:00:00.0',
          previousFrom: '2025-07-01 00:00:00.0',
          previousTo: '2025-09-30 00:00:00.0',
          nextRelease: '2026-03-17 08:00:00.0',
          nextReleaseId: 209143,
          upcomingReleases: [
            {
              id: 209143,
              publishTime: '2026-03-17 08:00:00.0',
              periodFrom: '2025-10-01 00:00:00.0',
              periodTo: '2025-12-31 00:00:00.0',
            },
            {
              id: 209145,
              publishTime: '2026-06-16 08:00:00.0',
              periodFrom: '2026-01-01 00:00:00.0',
              periodTo: '2026-03-31 00:00:00.0',
            },
            {
              id: 209147,
              publishTime: '2026-09-22 08:00:00.0',
              periodFrom: '2026-04-01 00:00:00.0',
              periodTo: '2026-06-30 00:00:00.0',
            },
            {
              id: 209149,
              publishTime: '2026-12-15 08:00:00.0',
              periodFrom: '2026-07-01 00:00:00.0',
              periodTo: '2026-09-30 00:00:00.0',
            },
          ],
        },
        {
          id: 30343,
          frekvens: 'År',
          previousRelease: '2025-05-14 08:00:00.0',
          previousFrom: '2024-01-01 00:00:00.0',
          previousTo: '2024-12-31 00:00:00.0',
          nextRelease: '2026-05-12 08:00:00.0',
          nextReleaseId: 209151,
          upcomingReleases: {
            id: 209151,
            publishTime: '2026-05-12 08:00:00.0',
            periodFrom: '2025-01-01 00:00:00.0',
            periodTo: '2025-12-31 00:00:00.0',
          },
        },
      ],
    },
    {
      id: 0,
      shortName: 'mimir',
      name: 'Mimir',
      nameEN: 'Mimir',
      status: '',
      modifiedTime: '2025-12-16 09:23:21.0',
      variants: {
        id: '0',
        frekvens: 'Dag',
        previousRelease: '2025-12-16 08:00:00.0',
        previousFrom: '2025-12-16 08:00:00.0',
        previousTo: '2025-12-16 08:00:00.0',
        nextRelease: '2025-12-17 08:00:00.0',
        nextReleaseId: '0',
        upcomingReleases: {
          id: '0',
          publishTime: '2025-12-17 08:00:00.0',
          periodFrom: '2025-12-17 08:00:00.0',
          periodTo: '2025-12-17 08:00:00.0',
        },
      },
    },
  ],
}
