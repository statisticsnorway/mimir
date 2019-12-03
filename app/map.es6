// Related to map content type and map part
// Draws a map with highchart on json files located in assets/mapdata - static files for map
$(function() {
  // Highmap kommunefakta
  $('#map').each((i, map) => {
    const path = $(map).attr('data-path')
    const service = $(map).attr('data-service')
    const borderWidth = $(map).hasClass('map-border') ? 20 : 0

    // Load the drilldown map
    $.getJSON(`${path}/norge-fylkesinndelt.geo.json`, function(geojson) {
      let data = Highcharts.geojson(geojson, 'map') // Prepare the geojson

      // Set drilldown pointers
      $.each(data, function(i, el) {
        el.drilldown = el.properties.FYLKE
        el.value = i
      })

      // Instanciate the map
      Highcharts.mapChart('map', {
        accessibility: { enabled: false },
        chart: {
          margin: 40,
          borderColor: '#FFFFFF',
          borderWidth,
          backgroundColor: '#f0f7f9',
          events: {
            drilldown: function(e) {
              if (!e.seriesOptions) {
                const chart = this
                const mapKey = 'no-fylke-' + e.point.drilldown
                const fail = setTimeout(function() {
                    if (!Highcharts.maps[mapKey]) {
                      chart.showLoading('<i class="icon-frown"></i> Failed loading ' + e.point.name);
                      fail = setTimeout(function() {
                        chart.hideLoading();
                      }, 1000);
                    }
                  }, 3000);

                // Show the spinner
                chart.showLoading('<i class="icon-spinner icon-spin icon-3x"></i>'); // Font Awesome spinner

                // Load the drilldown map
                $.getJSON(path + '/' + mapKey + '.geo.json', function(geojson) {
                  // Prepare the geojson
                  data = Highcharts.geojson(geojson, 'map');

                  // Set a non-random bogus value
                  $.each(data, function(i, el) {
                    el.value = i;
                  });

                  // Hide loading and add series
                  chart.hideLoading();
                  clearTimeout(fail);
                  chart.addSeriesAsDrilldown(e.point, {
                    name: e.point.name,
                    data: data,
                    id: '{point.id}',
                    cursor: 'pointer',
                    dataLabels: { enabled: true, format: '{point.properties.NAVN}' },
                    point: {
                      events: {
                        click: function() {
                          kommnr = this.properties.KOMMUNENR;
                          if (kommnr.length == 3) {
                            kommnr = '0' + kommnr;
                          }
                          url = $('#finn-kommune-resultater').find('ul li a[id = '+ kommnr +']').attr('href');

                          axios.get(service, { params: { postalCode: kommnr }})
                            .then((result) => {
                              window.location.href = window.location.href.replace(/(arealplanlegging|kommunefakta)\/.*$/, '$1/') + result.data.municipality.path;
                            })
                        }
                      }
                    }
                  })
                })
              }


              this.setTitle(null, { text: e.point.name });
            },
            drillup: function() {
              this.setTitle(null, { text: '' });
            }
          }
        },
        tooltip: { headerFormat: '{point.key}', pointFormat: '{point.properties.NAVN}' },
        lang: { drillUpText: 'Se hele landet' },
        exporting: { enabled: false },
        title: { text: '' },
        credits: { enabled: false },
        legend: { enabled: false },
        colorAxis: { min: 0, minColor: '#FFFFFF', maxColor: '#FFFFFF' },
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            verticalAlign: 'bottom',
            symbolFill: 'CC0000',
            theme: {
              fill: '#ffffff',
              stroke: '#00824d'
            }
          }
        },
        plotOptions: { map: {
          borderColor: '#274247',
          states: { hover: { color: '#00824d' }}
        }},
        series: [{
          data: data,
          name: 'Norge',
          dataLabels: { enabled: false, format: '' },
          tooltip: { headerFormat: '{point.key}', pointFormat: '{point.properties.NAVN}' }
        }],

        drilldown: {
          activeDataLabelStyle: { color: '#FFFFFF', textDecoration: 'none', textShadow: '0 0 3px #000000' },
          drillUpButton: {
            relativeTo: 'spacingBox',
            position: { align: 'left', x: 40, y: 40 },
            theme: {
              fill: '#ffffff',
              stroke: '#00824d'
            }
          }
        }
      })
      $(map).attr('aria-hidden', 'true');
    })
  })
})
