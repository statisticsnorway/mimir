# Highcharts
[Documentation](https://www.highcharts.com/docs/index)  
[Api Reference](https://api.highcharts.com/highcharts/)  
[Demo Page](https://www.highcharts.com/demo/)  

Most of our Highcharts config is located in the [/lib/ssb/parts/highcharts](../src/main/resources/lib/ssb/parts/highcharts) folder. Aside from that, we also add and overwrite parts of the config in the [Highcharts React component](/src/main/resources/site/parts/highchart/Highchart.tsx). Mostly it's populating `series`, adding the `xAxis` config, formatting, workarounds, and making changes based on the datasource and/or graphType.

Highcharts can use three different datasources, [TBML](DataFeeds.md#tbml), [JSONStat](DataFeeds.md#jsonstat), or Excel. See their respective documentation for more info.
