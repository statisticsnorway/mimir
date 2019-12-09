// HIGHCHART
$(function() {
  const w = { height: $(window).height().toFixed(0), width: $(window).width().toFixed(0) };

  $('.btn-highchart-export').click((e) => {
    $(e.target).parent().find('.highcharts-button-box').first().trigger('click')
  })

  $('.hc-container').each(function(i, container) {
    const height = $(container).height()
    $(container).find('svg').attr('height', height)
  })

  const h1Size = w.width < 768 ? '14px' : '16px';

  // Initialisering av HighCharts-figurer fra tilhørende HTML-tabell
  $('.highcharts-canvas[id^="highcharts-"]').each(function(index, chart) {
    let xAxis
    let series
    let categories
    const lineColor = '#21383a'
    const canvas = $(chart)
    const municipality = $(chart).attr('data-municipality') || '0501' // Defaults to municipality 0501
    const municipalityName = $(chart).attr('data-municipality-name')
    const style = { color: '#21383a', fontSize: '13px', fontWeight: 'normal', fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif' }

    if (typeof highchart === 'object' && highchart.length) {
      const json = highchart[index] // NOTE: This only works if all charts on the page is dynamic data
      const copy = _.cloneDeep(json)
      if (canvas.data('type') === 'bar-negative') {
        const region = JSONstat(copy).Dataset(0).Slice({ Region: municipality })
        const male = region.toTable({ type: 'arrobj' }, (a) => a.Kjonn === 'Menn' && -a.value || undefined )
        const female = region.toTable({ type: 'arrobj' }, (a) => a.Kjonn === 'Kvinner' && a.value || undefined )
        const categories = region.toTable({ type: 'arrobj' }, (a) => a.Kjonn === 'Menn' && a.Alder || undefined )
        series = [{ name: 'Menn', data: male }, { name: 'Kvinner', data: female }]
        xAxis = [{ lineColor, categories, reversed: false, labels: { style, step: 1 }, accessibility: { description: 'Alder' }}]
      } else {
        let slices
        const dimension = JSONstat(json).Dataset(0).Dimension(1).length == 1 ? 2 : 1 // I'm just guessing here
        const labels = JSONstat(json).Dataset(0).Dimension(dimension).Category() // TODO: Need to check this, we might want a label field
        const values = JSONstat(json).Dataset(0).Slice({ Region: municipality }) || JSONstat(json).Dataset(0).Slice({ KOKkommuneregion0000: municipality })
        categories = [canvas.data('title')]
        for (let i=0; i<labels.length; i++) {
          (series || (series = [])).push({ name: labels[i].label, data: [values.value[i]] });
          (slices || (slices = [])).push({ name: labels[i].label, y: values.value[i] });
        }
        series = canvas.data('type') == 'pie' || canvas.data('switchrowsandcolumns') ? [{ name: 'Antall', data: slices }] : series
        if (canvas.data('switchrowsandcolumns')) {
          categories = slices.map((n) => n.name)
        }
      }
    }

    const highchartsContentKey = canvas.data('contentkey');

    // Bare kjør script hvis tabellen det skal hentes data fra, eksisterer på siden
    if ($('table#highcharts-datatable-' + highchartsContentKey)) {
      // Oversettelser hentes fra første figur, og settes bare 1 gang
      if (index === 0) {
        Highcharts.setOptions({
          lang: {
            contextButtonTitle: canvas.data('langcontextbuttontitle'),
            decimalPoint: ',',
            downloadJPEG: canvas.data('langdownloadjpeg'),
            downloadPDF: canvas.data('langdownloadpdf'),
            downloadPNG: canvas.data('langdownloadpng'),
            downloadSVG: canvas.data('langdownloadsvg'),
            downloadCSV: canvas.data('langdownloadcsv'),
            downloadXLS: canvas.data('langdownloadxls'),
            drillUpText: canvas.data('langdrilluptext') + ' {series.name}',
            loading: canvas.data('langloading'),
            noData: canvas.data('langnodata'),
            numericSymbols: [null, ' ' + canvas.data('langmillions'), ' ' + canvas.data('langbillions')],
            printChart: canvas.data('langprintchart'),
            resetZoom: canvas.data('langresetzoom'),
            resetZoomTitle: canvas.data('langresetzoomtitle'),
            thousandsSep: ' '
          }
        });
      }

      // Render chart
      canvas.highcharts({
        accessibility: { enabled: false },
        chart: {
          plotBorderColor: '#e6e6e6',
          spacingBottom: 18,
          plotBorderWidth: 0,
          style: {
            fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
            fontSize: '14px'
          },
          type: (canvas.data('type') == 'bar-negative') ? 'bar' : canvas.data('type'),
          spacing: [0, 10, 0, 0],
          zoomType: canvas.data('zoomtype')
          // marginRight: (canvas.data('legend-align') == 'right') ? 120 : null,
        },
        // SSB color palette:
        colors: ['#1a9d49', '#274247', '#3396d2', '#f0e442', '#f26539', '#aee5c3', '#ed51c9', '#0094a3', '#e9b200', '#143f90', '#075745', '#4b7272', '#6d58a4', '#83c1e9', '#b59924'],
        // TODO: This shoud be here on print?
        // Improved palette for color blindness
        // colors: ['#009e73', '#cc79a7', '#0072b2', '#000000', '#f0e442', '#cccccc', '#56b4e9', '#e69f00', '#d55e00'],
        // credits: {
        //  enabled: canvas.data('creditsenabled'),
        //   href: canvas.data('creditshref'),
        //  position: { align: 'left', y: -4, x: 15, verticalAlign: 'bottom' },
        //  style: { color: '#00824d', cursor: 'pointer', fontSize: '16px', textDecoration: 'underline', fontFamily: 'Roboto', marginTop: '20px' },
        //   text: canvas.data('creditstext')
        // },
        credits: { enabled: false },
        series,
        data: !series && {
          switchRowsAndColumns: canvas.data('switchrowsandcolumns'),
          decimalPoint: ',',
          // THIS IS WHERE WE GET THE DATA
          // More dynamic sources (API, etc.) should use series:... instead of data: table
          table: 'highcharts-datatable-' + highchartsContentKey,

          // En befolkningspyramide trenger negative verdier for det ene kjønnet
          parsed: function(columns) {
            $.each(columns, function(i, column) {
              if (canvas.data('type') == 'befolkningspyramide' && column[0] == 'Menn') {
                const negatedValues = column.slice(1).map(function(num) {
                  return Math.abs(num) * -1;
                });
                const args = [1, negatedValues.length].concat(negatedValues);
                Array.prototype.splice.apply(column, args);
              }
            });
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              height: 26,
              symbolX: 14.5,
              symbolY: 12.5,
              theme: { 'fill': '#fff', 'r': 3, 'stroke-width': 1, 'stroke': '#bbb' },
              x: 8,
              width: 28
            }
          },
          csv: { itemDelimiter: ';' },
          // Sett denne til false når man vil erstatte hamburgermeny med egen
          enabled: true
        },
        legend: {
          enabled: canvas.data('legendenabled'),
          align: canvas.data('legendalign'),
          verticalAlign: (canvas.data('legendalign') == 'right') ? 'top' : 'bottom',
          layout: (canvas.data('legendalign') == 'right') ? 'vertical' : 'horizontal',
          x: (canvas.data('legendalign') == 'right') ? 10 : 0,
          y: (canvas.data('legendalign') == 'right') ? 65 : 0,
          itemMarginBottom: (canvas.data('legendalign') == 'right') ? 25 : 0,
          itemWidth: (canvas.data('legendalign') == 'right') ? 95 : null,
          itemStyle: { color: '#21383a', fontSize: '12px', fontWeight: 'normal' },
          // Keyboard-accessible legend labels
          // labelFormatter: function () {
          // return '<button title="' + canvas.data('langvisskjul') + '">' + this.name + '</button>';
          // },
          useHTML: true
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            minSize: 250,
            dataLabels: {
              enabled: (canvas.data('pielegendunder') == 'under') ? false : true,
              style: { width: '150px' }
            },
            showInLegend: (canvas.data('pielegendunder') == 'under') ? true : false
          },
          series: {
            events: {
              // Keyboard-accessible legend labels
              legendItemClick: function(e) {
                // Possible bug: untested browser support for browserEvent (but works in IE8, chrome, FF...)
                $(e.browserEvent.target).toggleClass('disabled');
              }
            },
            marker: {
              enabledThreshold: 15
            },
            label: { enabled: true },
            stacking: canvas.data('plotoptionsseriesstacking'),
            states: {
              hover: {
                // Since marker: enabled has been set to false, lineWidth needs to be thicker than the default 2 in order to improve accessibility
                lineWidth: 4
              }
            }
          }
        },
        subtitle: {
          align: canvas.data('title-center'),
          style: { color: '#333', fontSize: '14px' },
          text: canvas.data('subtitletext'),
          x: 0,
          y: 48
        },
        title: {
          align: canvas.data('title-center'),
          style: { fontSize: h1Size, fontWeight: 'bold' },
          margin: 40,
          text: canvas.data('title'),
          x: 0,
          y: 18
        },
        xAxis: xAxis || {
          categories,
          allowDecimals: canvas.data('xaxisallowdecimals'),
          gridLineWidth: 1,
          lineColor,
          tickInterval: canvas.data('tickinterval'),
          labels: { enabled: canvas.data('switchrowsandcolumns'), style },
          max: canvas.data('xaxismax'),
          min: canvas.data('xaxismin'),
          // Confusing detail: when type=bar, X axis becomes Y and vice versa. In other words, include 'bar' in this if-test, instead of putting it in the yAxis config
          tickmarkPlacement: (canvas.data('type') == 'column' || canvas.data('type') == 'bar') ? 'between' : 'on',
          title: { style, text: canvas.data('xaxistitletext') || municipalityName },
          type: canvas.data('xaxistype'),
          reversed: false,
          tickWidth: 1,
          tickColor: '#21383a'
        },
        yAxis: {
          allowDecimals: canvas.data('yaxisallowdecimals'),
          labels: {
            style,
            format: '{value:,.0f}',
            formatter: function(a) {
              return (canvas.data('type') == 'bar-negative') ? Math.abs(a.value) : a.value
            }
          },
          max: canvas.data('yaxismax'),
          min: canvas.data('yaxismin'),
          stackLabels: { enabled: canvas.data('yaxisstacklabelsenabled') },
          tickWidth: 1,
          tickColor: '#21383a',
          lineWidth: 1,
          lineColor,
          title: { style, text: canvas.data('yaxistitletext'), align: 'high', offset: 0, rotation: 0, y: -10 },
          type: canvas.data('yaxistype')
        },
        tooltip: {
          crosshairs: canvas.data('type') == 'line' && { width: 1, color: '#9575ff', dashStyle: 'solid' },
          shadow: false,
          backgroundColor: 'white',
          valueDecimals: canvas.data('numberdecimals'),
          shared: canvas.data('combineinformation'),
          formatter: (canvas.data('type') === 'bar-negative') ? function() {
            return `<b>${this.series.name} ${this.point.category}:</b> ` + Highcharts.numberFormat(Math.abs(this.point.y), 0)
          } : ''
        }
      })
    }
  })
})
