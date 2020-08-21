const test = __non_webpack_require__('/lib/xp/testing')

const {
  pieDataTest
} = __non_webpack_require__( '/lib/highcharts/highchartsData')


exports.pieDataTest = function() {
  const result = pieDataTest(pieData)
  log.info('%s', JSON.stringify('resultxxx', null, 2))
  log.info('%s', JSON.stringify(result, null, 2))
  test.assertEquals(pieDataResult, result, 'Pie data does not match')
}


const pieData = {
  'categories': [
    'Grunnskolenivå',
    'Videregående skolenivå',
    'Fagskolenivå',
    'Universitets- og høgskolenivå, kort',
    'Universitets- og høgskolenivå, lang'
  ],
  'series': [
    {
      'name': 'Grunnskolenivå',
      'data': [
        25
      ]
    },
    {
      'name': 'Videregående skolenivå',
      'data': [
        37
      ]
    },
    {
      'name': 'Fagskolenivå',
      'data': [
        2
      ]
    },
    {
      'name': 'Universitets- og høgskolenivå, kort',
      'data': [
        24
      ]
    },
    {
      'name': 'Universitets- og høgskolenivå, lang',
      'data': [
        10
      ]
    }
  ]
}

const pieDataResult = {
  'categories': [
    'Grunnskolenivå',
    'Videregående skolenivå',
    'Fagskolenivå',
    'Universitets- og høgskolenivå, kort',
    'Universitets- og høgskolenivå, lang'
  ],
  'series': [
    {
      'name': 'Antall',
      'data': [
        {
          'name': 'Grunnskolenivå',
          'y': 25
        },
        {
          'name': 'Videregående skolenivå',
          'y': 37
        },
        {
          'name': 'Fagskolenivå',
          'y': 2
        },
        {
          'name': 'Universitets- og høgskolenivå, kort',
          'y': 24
        },
        {
          'name': 'Universitets- og høgskolenivå, lang',
          'y': 10
        }
      ]
    }
  ]
}
